import { supabase } from '../config/supabase.js'
import slugify from 'slugify'

// ─── LIST ────────────────────────────────────────────────────
// GET /api/products
// Query params: category, search, active, page, limit
export async function listProducts(req, res) {
    try {
        const {
            category,
            search,
            active = 'true',
            page = 1,
            limit = 12,
        } = req.query

        const from = (Number(page) - 1) * Number(limit)
        const to = from + Number(limit) - 1

        let query = supabase
            .from('products')
            .select('*, categories(id, name, slug)', { count: 'exact' })
            .range(from, to)
            .order('created_at', { ascending: false })

        if (active !== 'all') {
            query = query.eq('active', active === 'true')
        }

        if (category) {
            // Para filtrar por slug da categoria no Supabase, primeiro buscamos o category_id
            const { data: catData } = await supabase
                .from('categories')
                .select('id')
                .eq('slug', category)
                .single()
            if (catData) {
                query = query.eq('category_id', catData.id)
            } else {
                // Categoria não encontrada, retorna vazio
                return res.json({ data: [], pagination: { total: 0, page: Number(page), limit: Number(limit), pages: 0 } })
            }
        }

        if (search) {
            query = query.or(`name.ilike.%${search}%,description.ilike.%${search}%,code.ilike.%${search}%`)
        }

        const { data, error, count } = await query

        if (error) throw error

        return res.json({
            data,
            pagination: {
                total: count,
                page: Number(page),
                limit: Number(limit),
                pages: Math.ceil(count / Number(limit)),
            },
        })
    } catch (err) {
        return res.status(500).json({ error: err.message })
    }
}

// ─── GET ONE ─────────────────────────────────────────────────
// GET /api/products/:id
export async function getProduct(req, res) {
    try {
        const { id } = req.params

        const { data, error } = await supabase
            .from('products')
            .select('*, categories(id, name, slug)')
            .eq('id', id)
            .single()

        if (error) {
            if (error.code === 'PGRST116') {
                return res.status(404).json({ error: 'Produto não encontrado' })
            }
            throw error
        }

        return res.json(data)
    } catch (err) {
        return res.status(500).json({ error: err.message })
    }
}

// ─── GET BY SLUG ──────────────────────────────────────────────
// GET /api/products/slug/:slug
export async function getProductBySlug(req, res) {
    try {
        const { slug } = req.params

        const { data, error } = await supabase
            .from('products')
            .select('*, categories(id, name, slug)')
            .eq('slug', slug)
            .single()

        if (error) {
            if (error.code === 'PGRST116') {
                return res.status(404).json({ error: 'Produto não encontrado' })
            }
            throw error
        }

        return res.json(data)
    } catch (err) {
        return res.status(500).json({ error: err.message })
    }
}

// ─── CREATE ───────────────────────────────────────────────────
// POST /api/products
export async function createProduct(req, res) {
    try {
        const {
            code,
            name,
            description,
            price,
            price_from,
            stock,
            category_id,
            image_url,
            sizes,
            tags,
            active,
        } = req.body

        // Validações básicas
        if (!code || !name || price === undefined) {
            return res.status(400).json({ error: 'code, name e price são obrigatórios' })
        }

        if (Number(price) < 0) {
            return res.status(400).json({ error: 'price não pode ser negativo' })
        }

        const slug = slugify(name, { lower: true, strict: true, locale: 'pt' })

        const { data, error } = await supabase
            .from('products')
            .insert({
                code,
                name,
                slug,
                description,
                price: Number(price),
                price_from: price_from ? Number(price_from) : null,
                stock: stock ? Number(stock) : 0,
                category_id: category_id || null,
                image_url: image_url || null,
                sizes: sizes || [],
                tags: tags || [],
                active: active !== undefined ? active : true,
            })
            .select('*, categories(id, name, slug)')
            .single()

        if (error) {
            if (error.code === '23505') {
                return res.status(409).json({ error: 'Código ou slug já existem' })
            }
            throw error
        }

        return res.status(201).json(data)
    } catch (err) {
        return res.status(500).json({ error: err.message })
    }
}

// ─── UPDATE ───────────────────────────────────────────────────
// PUT /api/products/:id
export async function updateProduct(req, res) {
    try {
        const { id } = req.params
        const {
            code,
            name,
            description,
            price,
            price_from,
            stock,
            category_id,
            image_url,
            sizes,
            tags,
            active,
        } = req.body

        // Checa se existe
        const { data: existing, error: findError } = await supabase
            .from('products')
            .select('id')
            .eq('id', id)
            .single()

        if (findError || !existing) {
            return res.status(404).json({ error: 'Produto não encontrado' })
        }

        // Monta payload apenas com os campos enviados
        const payload = {}
        if (code !== undefined) payload.code = code
        if (name !== undefined) {
            payload.name = name
            payload.slug = slugify(name, { lower: true, strict: true, locale: 'pt' })
        }
        if (description !== undefined) payload.description = description
        if (price !== undefined) payload.price = Number(price)
        if (price_from !== undefined) payload.price_from = price_from ? Number(price_from) : null
        if (stock !== undefined) payload.stock = Number(stock)
        if (category_id !== undefined) payload.category_id = category_id || null
        if (image_url !== undefined) payload.image_url = image_url
        if (sizes !== undefined) payload.sizes = sizes
        if (tags !== undefined) payload.tags = tags
        if (active !== undefined) payload.active = active

        const { data, error } = await supabase
            .from('products')
            .update(payload)
            .eq('id', id)
            .select('*, categories(id, name, slug)')
            .single()

        if (error) {
            if (error.code === '23505') {
                return res.status(409).json({ error: 'Código ou slug já existem' })
            }
            throw error
        }

        return res.json(data)
    } catch (err) {
        return res.status(500).json({ error: err.message })
    }
}

// ─── DELETE ───────────────────────────────────────────────────
// DELETE /api/products/:id
export async function deleteProduct(req, res) {
    try {
        const { id } = req.params

        const { error } = await supabase
            .from('products')
            .delete()
            .eq('id', id)

        if (error) throw error

        return res.status(204).send()
    } catch (err) {
        return res.status(500).json({ error: err.message })
    }
}

// ─── TOGGLE ACTIVE ────────────────────────────────────────────
// PATCH /api/products/:id/toggle
export async function toggleActive(req, res) {
    try {
        const { id } = req.params

        const { data: current, error: findError } = await supabase
            .from('products')
            .select('active')
            .eq('id', id)
            .single()

        if (findError || !current) {
            return res.status(404).json({ error: 'Produto não encontrado' })
        }

        const { data, error } = await supabase
            .from('products')
            .update({ active: !current.active })
            .eq('id', id)
            .select('id, name, active')
            .single()

        if (error) throw error

        return res.json(data)
    } catch (err) {
        return res.status(500).json({ error: err.message })
    }
}