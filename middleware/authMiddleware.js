import jwt from 'jsonwebtoken'
import { supabase } from '../config/supabase.js'

const JWT_SECRET = process.env.JWT_SECRET || 'b7store-secret-change-in-production'

export async function requireAdmin(req, res, next) {
    try {
        const authHeader = req.headers.authorization
        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            return res.status(401).json({ error: 'Token não fornecido' })
        }

        const token = authHeader.slice(7)
        let payload
        try {
            payload = jwt.verify(token, JWT_SECRET)
        } catch {
            return res.status(401).json({ error: 'Token inválido ou expirado' })
        }

        // Verifica se sessão ainda existe no banco (não foi invalidada via logout)
        const { data: session } = await supabase
            .from('admin_sessions')
            .select('id')
            .eq('token_jti', payload.jti)
            .single()

        if (!session) {
            return res.status(401).json({ error: 'Sessão encerrada' })
        }

        req.adminId = payload.sub
        req.adminName = payload.name
        req.adminEmail = payload.email
        req.adminJti = payload.jti
        next()
    } catch (err) {
        return res.status(500).json({ error: err.message })
    }
}