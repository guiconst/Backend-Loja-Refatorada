import { supabase } from '../config/supabase.js'
import slugify from 'slugify'

// GET /api/categories
export async function listCategories(req, res) {
    try {
        const { data, error } = await supabase
            .from('categories')
            .select('*')
            .order('name')

        if (error) throw error
        return res.json(data)
    } catch (err) {
        return res.status(500).json({ error: err.message })
    }
}

// GET /api/categories/:id
export async function getCategory(req, res) {
    try {
        const { id } = req.params
        const { data, error } = await supabase
            .from('categories')
            .select('*, products(id, name, slug, price, image_url, active)')
            .eq('id', id)
            .single()

        if (error) {
            if (error.code === 'PGRST116') {
                return res.status(404).json({ error: 'Categoria não encontrada' })
            }
            throw error
        }
        return res.json(data)
    } catch (err) {
        return res.status(500).json({ error: err.message })
    }
}

// POST /api/categories
export async function createCategory(req, res) {
    try {
        const { name } = req.body
        if (!name) return res.status(400).json({ error: 'name é obrigatório' })

        const slug = slugify(name, { lower: true, strict: true, locale: 'pt' })

        const { data, error } = await supabase
            .from('categories')
            .insert({ name, slug })
            .select()
            .single()

        if (error) {
            if (error.code === '23505') {
                return res.status(409).json({ error: 'Categoria já existe' })
            }
            throw error
        }
        return res.status(201).json(data)
    } catch (err) {
        return res.status(500).json({ error: err.message })
    }
}

// PUT /api/categories/:id
export async function updateCategory(req, res) {
    try {
        const { id } = req.params
        const { name } = req.body
        if (!name) return res.status(400).json({ error: 'name é obrigatório' })

        const slug = slugify(name, { lower: true, strict: true, locale: 'pt' })

        const { data, error } = await supabase
            .from('categories')
            .update({ name, slug })
            .eq('id', id)
            .select()
            .single()

        if (error) throw error
        return res.json(data)
    } catch (err) {
        return res.status(500).json({ error: err.message })
    }
}

// DELETE /api/categories/:id
export async function deleteCategory(req, res) {
    try {
        const { id } = req.params
        const { error } = await supabase.from('categories').delete().eq('id', id)
        if (error) throw error
        return res.status(204).send()
    } catch (err) {
        return res.status(500).json({ error: err.message })
    }
}
