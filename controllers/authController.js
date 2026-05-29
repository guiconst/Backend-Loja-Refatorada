import crypto from 'crypto';
import { supabase } from '../config/supabase.js'
import bcrypt from 'bcrypt'
import jwt from 'jsonwebtoken'

const JWT_SECRET = process.env.JWT_SECRET || 'b7store-secret-change-in-production'
const JWT_EXPIRES = '8h'

// POST /api/admin/auth/login
export async function login(req, res) {
    try {
        const { email, password } = req.body
        if (!email || !password) {
            return res.status(400).json({ error: 'email e password são obrigatórios' })
        }

        const { data: admin, error } = await supabase
            .from('admin_users')
            .select('*')
            .eq('email', email)
            .eq('active', true)
            .single()

        if (error || !admin) {
            return res.status(401).json({ error: 'Credenciais inválidas' })
        }

        const valid = await bcrypt.compare(password, admin.password)
        if (!valid) {
            return res.status(401).json({ error: 'Credenciais inválidas' })
        }

        // Gera JWT com jti único
        const jti = crypto.randomUUID()
        const token = jwt.sign(
            { sub: admin.id, name: admin.name, email: admin.email, jti },
            JWT_SECRET,
            { expiresIn: JWT_EXPIRES }
        )

        // Registra sessão no banco
        const expiresAt = new Date(Date.now() + 8 * 60 * 60 * 1000).toISOString()
        await supabase.from('admin_sessions').insert({
            admin_id: admin.id,
            token_jti: jti,
            expires_at: expiresAt,
        })

        return res.json({
            token,
            admin: { id: admin.id, name: admin.name, email: admin.email },
        })
    } catch (err) {
        return res.status(500).json({ error: err.message })
    }
}

// POST /api/admin/auth/logout
export async function logout(req, res) {
    try {
        const jti = req.adminJti
        if (jti) {
            await supabase.from('admin_sessions').delete().eq('token_jti', jti)
        }
        return res.json({ message: 'Logout realizado com sucesso' })
    } catch (err) {
        return res.status(500).json({ error: err.message })
    }
}

// GET /api/admin/auth/me
export async function me(req, res) {
    return res.json({
        id: req.adminId,
        name: req.adminName,
        email: req.adminEmail,
    })
}