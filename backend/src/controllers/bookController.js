const { Book, Review, User, sequelize } = require('../models')
const { Op } = require('sequelize')
const { validationResult } = require('express-validator')

exports.getAllBooks = async (req, res) => {
  try {
    let { page = 1, limit = 20, search, genre, available, rating, sort } = req.query
    page = parseInt(page)
    limit = parseInt(limit)
    const offset = (page - 1) * limit

    const where = {}
    if (search) {
      const searchTerms = search.trim().split(/\s+/);
      const searchConditions = searchTerms.map(term => {
        const termLower = term.toLowerCase();
        return {
          [Op.or]: [
            sequelize.where(sequelize.fn('LOWER', sequelize.col('title')), 'LIKE', `%${termLower}%`),
            sequelize.where(sequelize.fn('LOWER', sequelize.col('author')), 'LIKE', `%${termLower}%`),
            { isbn: { [Op.like]: `%${term}%` } }
          ]
        };
      });
      where[Op.and] = searchConditions;
    }

    if (genre) where.genre = genre
    if (available === 'true') where.available_copies = { [Op.gt]: 0 }

    let order = [['created_at', 'DESC']]
    if (sort === 'title_asc') order = [['title', 'ASC']]
    if (sort === 'newest') order = [['created_at', 'DESC']]

    const include = [
      {
        model: Review,
        attributes: []
      }
    ]

    const attributes = {
      include: [
        [
          sequelize.literal(`(
            SELECT ROUND(AVG(rating), 1)
            FROM reviews AS Review
            WHERE Review.book_id = Book.id
          )`),
          'rating'
        ],
        [
          sequelize.literal(`(
            SELECT COUNT(*)
            FROM reviews AS Review
            WHERE Review.book_id = Book.id
          )`),
          'rating_count'
        ]
      ]
    }

    const { count, rows } = await Book.findAndCountAll({
      where,
      limit,
      offset,
      order,
      attributes,
      distinct: true
    })

    const totalItems = count

    res.json({
      books: rows,
      total: totalItems,
      page,
      totalPages: Math.ceil(totalItems / limit),
      limit
    })
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
}

exports.getBookById = async (req, res) => {
  try {
    const book = await Book.findByPk(req.params.id, {
      include: [
        {
          model: Review,
          include: [{ model: User, attributes: ['name', 'avatar'] }]
        }
      ]
    })

    if (!book) return res.status(404).json({ error: 'Book not found' })

    const bookData = book.toJSON()
    const reviews = bookData.Reviews || []
    bookData.rating_count = reviews.length
    bookData.rating = reviews.length > 0 
      ? (reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length).toFixed(1)
      : 0
    bookData.avg_rating = bookData.rating // Keep for safety
    bookData.review_count = bookData.rating_count

    res.json({ book: bookData })
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
}

exports.getFeaturedBook = async (req, res) => {
  try {
    let book = await Book.findOne({
      where: { is_featured: true },
      include: [Review]
    })

    if (!book) {
      book = await Book.findOne({ order: [['created_at', 'DESC']], include: [Review] })
    }

    if (!book) return res.status(404).json({ error: 'No books found' })

    const bookData = book.toJSON()
    const reviews = bookData.Reviews || []
    bookData.rating_count = reviews.length
    bookData.rating = reviews.length > 0 
      ? (reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length).toFixed(1)
      : 0
    bookData.avg_rating = bookData.rating // Keep for safety
    bookData.review_count = bookData.rating_count

    res.json({ book: bookData })
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
}

exports.createBook = async (req, res) => {
  const errors = validationResult(req)
  if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() })

  try {
    const data = req.body
    if (req.file) data.cover_image = `/uploads/${req.file.filename}`
    
    if (data.isbn) {
      const exists = await Book.findOne({ where: { isbn: data.isbn } })
      if (exists) return res.status(400).json({ error: 'ISBN already exists' })
    }

    if (parseInt(data.available_copies) > parseInt(data.total_copies)) {
      return res.status(400).json({ error: 'Available copies cannot exceed total copies' })
    }

    const book = await Book.create(data)
    res.status(201).json({ book })
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
}

exports.updateBook = async (req, res) => {
  try {
    const book = await Book.findByPk(req.params.id)
    if (!book) return res.status(404).json({ error: 'Book not found' })

    const data = req.body
    if (req.file) data.cover_image = `/uploads/${req.file.filename}`

    if (data.available_copies && data.total_copies) {
      if (parseInt(data.available_copies) > parseInt(data.total_copies)) {
        return res.status(400).json({ error: 'Available copies cannot exceed total copies' })
      }
    } else if (data.available_copies && parseInt(data.available_copies) > book.total_copies) {
       return res.status(400).json({ error: 'Available copies cannot exceed total copies' })
    }

    await book.update(data)
    res.json({ book })
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
}

exports.deleteBook = async (req, res) => {
  try {
    const book = await Book.findByPk(req.params.id)
    if (!book) return res.status(404).json({ error: 'Book not found' })

    const { Borrow } = require('../models')
    const active = await Borrow.findOne({ where: { book_id: book.id, status: 'active' } })
    if (active) return res.status(400).json({ error: 'Cannot delete book with active borrows' })

    await book.destroy()
    res.json({ message: 'Book deleted' })
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
}
