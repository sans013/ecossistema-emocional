import { Pool, PoolClient } from 'pg';
import {
  ContextSlug,
  EmotionalRecord,
  ReflectionSummary,
} from '../../domain/entities/EmotionalRecord';
import {
  CreateEmotionalRecordData,
  EmotionalRecordRepository,
  ListEmotionalRecordsFilter,
  UpdateEmotionalRecordData,
} from '../../domain/repositories/EmotionalRecordRepository';

interface RecordRow {
  id: string;
  usuario_id: string;
  nivel_humor: number;
  pensamento: string | null;
  registrado_em: Date;
  atualizado_em: Date;
  contextos: ContextSlug[] | null;
}

function mapRecord(row: RecordRow): EmotionalRecord {
  return {
    id: row.id,
    usuarioId: row.usuario_id,
    nivelHumor: Number(row.nivel_humor),
    contextos: row.contextos ?? [],
    pensamento: row.pensamento,
    registradoEm: row.registrado_em,
    atualizadoEm: row.atualizado_em,
  };
}

export class PgEmotionalRecordRepository implements EmotionalRecordRepository {
  constructor(private readonly pool: Pool) {}

  private async attachContexts(
    client: PoolClient,
    registroId: string,
    contextos: ContextSlug[]
  ): Promise<void> {
    if (contextos.length === 0) {
      return;
    }

    await client.query(
      `INSERT INTO registro_contextos (registro_id, contexto_id)
       SELECT $1, c.id
       FROM contextos c
       WHERE c.slug = ANY($2::text[])`,
      [registroId, contextos]
    );
  }

  async create(data: CreateEmotionalRecordData): Promise<EmotionalRecord> {
    const client = await this.pool.connect();
    try {
      await client.query('BEGIN');

      const insertResult = await client.query<RecordRow>(
        `INSERT INTO registros_emocionais (usuario_id, nivel_humor, pensamento)
         VALUES ($1, $2, $3)
         RETURNING id, usuario_id, nivel_humor, pensamento, registrado_em, atualizado_em`,
        [data.usuarioId, data.nivelHumor, data.pensamento]
      );

      const created = insertResult.rows[0];
      await this.attachContexts(client, created.id, data.contextos);

      await client.query('COMMIT');

      return {
        ...mapRecord(created),
        contextos: data.contextos,
      };
    } catch (err) {
      await client.query('ROLLBACK');
      throw err;
    } finally {
      client.release();
    }
  }

  async findAllByUser(
    userId: string,
    filters?: ListEmotionalRecordsFilter
  ): Promise<EmotionalRecord[]> {
    const conditions = ['r.usuario_id = $1'];
    const params: unknown[] = [userId];
    let paramIndex = 2;

    if (filters?.contexto) {
      conditions.push(`
        EXISTS (
          SELECT 1
          FROM registro_contextos rc_filter
          INNER JOIN contextos c_filter ON c_filter.id = rc_filter.contexto_id
          WHERE rc_filter.registro_id = r.id
            AND c_filter.slug = $${paramIndex++}
        )
      `);
      params.push(filters.contexto);
    }

    if (filters?.dias) {
      conditions.push(`r.registrado_em >= NOW() - ($${paramIndex++} * INTERVAL '1 day')`);
      params.push(filters.dias);
    }

    const result = await this.pool.query<RecordRow>(
      `SELECT r.id, r.usuario_id, r.nivel_humor, r.pensamento,
              r.registrado_em, r.atualizado_em,
              COALESCE(array_agg(c.slug ORDER BY c.id) FILTER (WHERE c.slug IS NOT NULL), '{}') AS contextos
       FROM registros_emocionais r
       LEFT JOIN registro_contextos rc ON rc.registro_id = r.id
       LEFT JOIN contextos c ON c.id = rc.contexto_id
       WHERE ${conditions.join(' AND ')}
       GROUP BY r.id
       ORDER BY r.registrado_em DESC`,
      params
    );

    return result.rows.map(mapRecord);
  }

  async findByIdAndUser(id: string, userId: string): Promise<EmotionalRecord | null> {
    const result = await this.pool.query<RecordRow>(
      `SELECT r.id, r.usuario_id, r.nivel_humor, r.pensamento,
              r.registrado_em, r.atualizado_em,
              COALESCE(array_agg(c.slug ORDER BY c.id) FILTER (WHERE c.slug IS NOT NULL), '{}') AS contextos
       FROM registros_emocionais r
       LEFT JOIN registro_contextos rc ON rc.registro_id = r.id
       LEFT JOIN contextos c ON c.id = rc.contexto_id
       WHERE r.id = $1 AND r.usuario_id = $2
       GROUP BY r.id`,
      [id, userId]
    );

    const row = result.rows[0];
    return row ? mapRecord(row) : null;
  }

  async update(
    id: string,
    userId: string,
    data: UpdateEmotionalRecordData
  ): Promise<EmotionalRecord | null> {
    const client = await this.pool.connect();
    try {
      await client.query('BEGIN');

      const updateResult = await client.query<RecordRow>(
        `UPDATE registros_emocionais
         SET nivel_humor = $3,
             pensamento = $4,
             atualizado_em = NOW()
         WHERE id = $1 AND usuario_id = $2
         RETURNING id, usuario_id, nivel_humor, pensamento, registrado_em, atualizado_em`,
        [id, userId, data.nivelHumor, data.pensamento]
      );

      const updated = updateResult.rows[0];
      if (!updated) {
        await client.query('ROLLBACK');
        return null;
      }

      await client.query('DELETE FROM registro_contextos WHERE registro_id = $1', [id]);
      await this.attachContexts(client, id, data.contextos);

      await client.query('COMMIT');

      return {
        ...mapRecord(updated),
        contextos: data.contextos,
      };
    } catch (err) {
      await client.query('ROLLBACK');
      throw err;
    } finally {
      client.release();
    }
  }

  async delete(id: string, userId: string): Promise<boolean> {
    const result = await this.pool.query(
      'DELETE FROM registros_emocionais WHERE id = $1 AND usuario_id = $2',
      [id, userId]
    );
    return (result.rowCount ?? 0) > 0;
  }

  async getReflectionSummary(
    userId: string,
    periodoDias: 7 | 30
  ): Promise<ReflectionSummary> {
    const moodResult = await this.pool.query<{ nivel_humor: number; quantidade: string }>(
      `SELECT nivel_humor, COUNT(*)::text AS quantidade
       FROM registros_emocionais
       WHERE usuario_id = $1
         AND registrado_em >= NOW() - ($2 * INTERVAL '1 day')
       GROUP BY nivel_humor
       ORDER BY COUNT(*) DESC, nivel_humor DESC`,
      [userId, periodoDias]
    );

    const contextResult = await this.pool.query<{
      slug: ContextSlug;
      nome: string;
      quantidade: string;
    }>(
      `SELECT c.slug, c.nome, COUNT(*)::text AS quantidade
       FROM registros_emocionais r
       INNER JOIN registro_contextos rc ON rc.registro_id = r.id
       INNER JOIN contextos c ON c.id = rc.contexto_id
       WHERE r.usuario_id = $1
         AND r.registrado_em >= NOW() - ($2 * INTERVAL '1 day')
       GROUP BY c.id, c.slug, c.nome
       ORDER BY COUNT(*) DESC, c.id ASC`,
      [userId, periodoDias]
    );

    const frequenciaHumores = moodResult.rows.map((row) => ({
      nivelHumor: Number(row.nivel_humor),
      quantidade: Number(row.quantidade),
    }));

    const totalRegistros = frequenciaHumores.reduce((acc, item) => acc + item.quantidade, 0);

    return {
      periodoDias,
      totalRegistros,
      frequenciaHumores,
      contextosMaisPresentes: contextResult.rows.map((row) => ({
        slug: row.slug,
        nome: row.nome,
        quantidade: Number(row.quantidade),
      })),
    };
  }
}