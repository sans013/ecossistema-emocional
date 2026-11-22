import { Pool } from 'pg';
import {
  EcosystemLevel,
  FontSizeOption,
  PublicUser,
  ReminderShift,
  User,
  UserExportData,
  UserPreferences,
  UserProfile,
} from '../../domain/entities/User';
import {
  CreateUserData,
  UpdatePreferencesData,
  UserRepository,
} from '../../domain/repositories/UserRepository';

interface UserRow {
  id: string;
  nome_exibicao: string;
  email: string;
  senha_hash?: string;
  consentimento_lgpd: boolean;
  consentimento_aceito_em: Date | null;
  criado_em: Date;
  atualizado_em: Date;
}

interface PreferencesRow {
  usuario_id: string;
  nivel_ecossistema: EcosystemLevel;
  rotulos_humor_custom: Record<string, string>;
  lembretes_ativos: boolean;
  lembretes_turnos: ReminderShift[];
  tamanho_fonte: FontSizeOption;
  rotulos_sempre_visiveis: boolean;
  atualizado_em: Date;
}

function mapPublicUser(row: UserRow): PublicUser {
  return {
    id: row.id,
    nomeExibicao: row.nome_exibicao,
    email: row.email,
    consentimentoLgpd: row.consentimento_lgpd,
    consentimentoAceitoEm: row.consentimento_aceito_em,
    criadoEm: row.criado_em,
    atualizadoEm: row.atualizado_em,
  };
}

function mapPreferences(row: PreferencesRow): UserPreferences {
  return {
    usuarioId: row.usuario_id,
    nivelEcossistema: row.nivel_ecossistema,
    rotulosHumorCustom: row.rotulos_humor_custom ?? {},
    lembretesAtivos: row.lembretes_ativos,
    lembretesTurnos: row.lembretes_turnos ?? [],
    tamanhoFonte: row.tamanho_fonte,
    rotulosSempreVisiveis: row.rotulos_sempre_visiveis,
    atualizadoEm: row.atualizado_em,
  };
}

export class PgUserRepository implements UserRepository {
  constructor(private readonly pool: Pool) {}

  async findByEmail(email: string): Promise<User | null> {
    const result = await this.pool.query<UserRow>(
      `SELECT id, nome_exibicao, email, senha_hash, consentimento_lgpd,
              consentimento_aceito_em, criado_em, atualizado_em
       FROM usuarios
       WHERE email = $1`,
      [email]
    );

    const row = result.rows[0];
    if (!row || !row.senha_hash) {
      return null;
    }

    return {
      ...mapPublicUser(row),
      senhaHash: row.senha_hash,
    };
  }

  async findProfileById(userId: string): Promise<UserProfile | null> {
    const result = await this.pool.query(
      `SELECT u.id, u.nome_exibicao, u.email, u.consentimento_lgpd,
              u.consentimento_aceito_em, u.criado_em, u.atualizado_em,
              p.usuario_id, p.nivel_ecossistema, p.rotulos_humor_custom,
              p.lembretes_ativos, p.lembretes_turnos, p.tamanho_fonte,
              p.rotulos_sempre_visiveis, p.atualizado_em AS pref_atualizado_em
       FROM usuarios u
       INNER JOIN preferencias_usuario p ON p.usuario_id = u.id
       WHERE u.id = $1`,
      [userId]
    );

    const row = result.rows[0];
    if (!row) {
      return null;
    }

    return {
      usuario: mapPublicUser(row),
      preferencias: mapPreferences({
        usuario_id: row.usuario_id,
        nivel_ecossistema: row.nivel_ecossistema,
        rotulos_humor_custom: row.rotulos_humor_custom,
        lembretes_ativos: row.lembretes_ativos,
        lembretes_turnos: row.lembretes_turnos,
        tamanho_fonte: row.tamanho_fonte,
        rotulos_sempre_visiveis: row.rotulos_sempre_visiveis,
        atualizado_em: row.pref_atualizado_em,
      }),
    };
  }

  async createWithDefaultPreferences(data: CreateUserData): Promise<UserProfile> {
    const client = await this.pool.connect();
    try {
      await client.query('BEGIN');

      const userResult = await client.query<UserRow>(
        `INSERT INTO usuarios (nome_exibicao, email, senha_hash)
         VALUES ($1, $2, $3)
         RETURNING id, nome_exibicao, email, consentimento_lgpd,
                   consentimento_aceito_em, criado_em, atualizado_em`,
        [data.nomeExibicao, data.email, data.senhaHash]
      );

      const createdUser = userResult.rows[0];

      const prefResult = await client.query<PreferencesRow>(
        `INSERT INTO preferencias_usuario (usuario_id)
         VALUES ($1)
         RETURNING usuario_id, nivel_ecossistema, rotulos_humor_custom,
                   lembretes_ativos, lembretes_turnos, tamanho_fonte,
                   rotulos_sempre_visiveis, atualizado_em`,
        [createdUser.id]
      );

      await client.query('COMMIT');

      return {
        usuario: mapPublicUser(createdUser),
        preferencias: mapPreferences(prefResult.rows[0]),
      };
    } catch (err) {
      await client.query('ROLLBACK');
      throw err;
    } finally {
      client.release();
    }
  }

  async recordLgpdConsent(userId: string): Promise<PublicUser | null> {
    const result = await this.pool.query<UserRow>(
      `UPDATE usuarios
       SET consentimento_lgpd = TRUE,
           consentimento_aceito_em = COALESCE(consentimento_aceito_em, NOW()),
           atualizado_em = NOW()
       WHERE id = $1
       RETURNING id, nome_exibicao, email, consentimento_lgpd,
                 consentimento_aceito_em, criado_em, atualizado_em`,
      [userId]
    );

    const row = result.rows[0];
    return row ? mapPublicUser(row) : null;
  }

  async updatePreferences(
    userId: string,
    data: UpdatePreferencesData
  ): Promise<UserPreferences | null> {
    const sets: string[] = [];
    const values: unknown[] = [];
    let paramIndex = 1;

    if (data.nivelEcossistema !== undefined) {
      sets.push(`nivel_ecossistema = $${paramIndex++}`);
      values.push(data.nivelEcossistema);
    }
    if (data.rotulosHumorCustom !== undefined) {
      sets.push(`rotulos_humor_custom = $${paramIndex++}::jsonb`);
      values.push(JSON.stringify(data.rotulosHumorCustom));
    }
    if (data.lembretesAtivos !== undefined) {
      sets.push(`lembretes_ativos = $${paramIndex++}`);
      values.push(data.lembretesAtivos);
    }
    if (data.lembretesTurnos !== undefined) {
      sets.push(`lembretes_turnos = $${paramIndex++}::text[]`);
      values.push(data.lembretesTurnos);
    }
    if (data.tamanhoFonte !== undefined) {
      sets.push(`tamanho_fonte = $${paramIndex++}`);
      values.push(data.tamanhoFonte);
    }
    if (data.rotulosSempreVisiveis !== undefined) {
      sets.push(`rotulos_sempre_visiveis = $${paramIndex++}`);
      values.push(data.rotulosSempreVisiveis);
    }

    sets.push('atualizado_em = NOW()');
    values.push(userId);

    const result = await this.pool.query<PreferencesRow>(
      `UPDATE preferencias_usuario
       SET ${sets.join(', ')}
       WHERE usuario_id = $${paramIndex}
       RETURNING usuario_id, nivel_ecossistema, rotulos_humor_custom,
                 lembretes_ativos, lembretes_turnos, tamanho_fonte,
                 rotulos_sempre_visiveis, atualizado_em`,
      values
    );

    const row = result.rows[0];
    return row ? mapPreferences(row) : null;
  }

  async exportAllUserData(userId: string): Promise<UserExportData | null> {
    const profile = await this.findProfileById(userId);
    if (!profile) {
      return null;
    }

    const recordsResult = await this.pool.query(
      `SELECT r.id, r.nivel_humor, r.pensamento, r.registrado_em, r.atualizado_em,
              COALESCE(array_agg(c.slug) FILTER (WHERE c.slug IS NOT NULL), '{}') AS contextos
       FROM registros_emocionais r
       LEFT JOIN registro_contextos rc ON rc.registro_id = r.id
       LEFT JOIN contextos c ON c.id = rc.contexto_id
       WHERE r.usuario_id = $1
       GROUP BY r.id
       ORDER BY r.registrado_em DESC`,
      [userId]
    );

    return {
      exportadoEm: new Date().toISOString(),
      usuario: profile.usuario,
      preferencias: profile.preferencias,
      registros: recordsResult.rows.map((row) => ({
        id: row.id,
        nivelHumor: row.nivel_humor,
        contextos: row.contextos ?? [],
        pensamento: row.pensamento,
        registradoEm: row.registrado_em,
        atualizadoEm: row.atualizado_em,
      })),
    };
  }

  async deleteAllRecords(userId: string): Promise<void> {
    await this.pool.query('DELETE FROM registros_emocionais WHERE usuario_id = $1', [userId]);
  }

  async deleteAccount(userId: string): Promise<boolean> {
    const result = await this.pool.query('DELETE FROM usuarios WHERE id = $1', [userId]);
    return (result.rowCount ?? 0) > 0;
  }
}