const bcrypt = require('bcryptjs')
const { User, Book, Branch, Review } = require('../models')

async function seedDatabase() {
  // Check if seeding is already done (based on some core data like admin)
  const isSeeded = await User.findOne({ where: { role: 'admin' } })
  if (isSeeded) {
    console.log('Database already seeded. Skipping.')
    return
  }

  console.log('Seeding Database for the first time...')

  // 1. ADMIN ACCOUNT
  const hashed = await bcrypt.hash('12345678', 12)
  await User.create({
    name: 'BookVault Admin',
    email: 'bookvaultadmin@gmail.com',
    password: hashed,
    role: 'admin',
    card_id: 'BV-ADMIN-001'
  })
  console.log('Admin account created.')

  // 2. BRANCHES (3 branches)
  const branchData = [
    {
      name: 'Main Campus Library',
      address: 'Block A, University Road',
      open_time: '08:00:00', close_time: '21:00:00'
    },
    {
      name: 'North Wing Reading Centre',
      address: 'Block C, North Campus',
      open_time: '09:00:00', close_time: '19:00:00'
    },
    {
      name: 'South Block Library',
      address: 'Block F, South Campus',
      open_time: '10:00:00', close_time: '18:00:00'
    },
  ]
  await Branch.bulkCreate(branchData)
  console.log('Branches created.')

  // 3. SAMPLE BOOKS (21 books)
  const books = await Book.bulkCreate([
    {
      title: 'The Great Gatsby',
      author: 'F. Scott Fitzgerald',
      isbn: '978-0-7432-7356-5',
      genre: 'Classic Fiction',
      description: 'A portrait of the Jazz Age in all of its decadence and excess, Gatsby captures the spirit of the American Dream and the inevitable corruption of idealism.',
      total_copies: 10,
      available_copies: 10,
      published_year: 1925,
      pages: 180,
      language: 'English',
      gutenberg_url: 'https://www.gutenberg.org/ebooks/64317',
      is_featured: true,
      cover_bg: '#1E3A5F',
      cover_accent: '#60A5FA',
      cover_text: '#EFF6FF'
    },
    {
      title: '1984',
      author: 'George Orwell',
      isbn: '978-0-452-28423-4',
      genre: 'Science Fiction',
      description: 'A dystopian masterpiece set in a totalitarian society where Big Brother watches your every move. A chilling warning about the dangers of unchecked power.',
      total_copies: 8,
      available_copies: 8,
      published_year: 1949,
      pages: 328,
      language: 'English',
      gutenberg_url: null,
      is_featured: false,
      cover_bg: '#1A1A2E',
      cover_accent: '#E94560',
      cover_text: '#F5F5F5'
    },
    {
      title: 'Sapiens',
      author: 'Yuval Noah Harari',
      isbn: '978-0-06-231609-7',
      genre: 'Non-Fiction',
      description: 'A brief history of humankind from the Stone Age to the present. Harari weaves together history, biology, philosophy and economics to explore how Homo sapiens came to dominate Earth.',
      total_copies: 6,
      available_copies: 6,
      published_year: 2011,
      pages: 443,
      language: 'English',
      gutenberg_url: null,
      is_featured: false,
      cover_bg: '#2D4A22',
      cover_accent: '#8BC34A',
      cover_text: '#F1F8E9'
    },
    {
      title: 'To Kill a Mockingbird',
      author: 'Harper Lee',
      isbn: '978-0-06-112008-4',
      genre: 'Classic Fiction',
      description: 'Through the eyes of young Scout Finch, this Pulitzer Prize-winning novel explores racial injustice and moral growth in the American South during the 1930s.',
      total_copies: 12,
      available_copies: 12,
      published_year: 1960,
      pages: 281,
      language: 'English',
      gutenberg_url: null,
      is_featured: false,
      cover_bg: '#3E2723',
      cover_accent: '#FF8F00',
      cover_text: '#FFF8E1'
    },
    {
      title: 'A Brief History of Time',
      author: 'Stephen Hawking',
      isbn: '978-0-553-38016-3',
      genre: 'Science',
      description: 'From the Big Bang to black holes, Hawking guides us on a journey through the universe explaining the most complex concepts in physics with remarkable clarity.',
      total_copies: 3,
      available_copies: 3,
      published_year: 1988,
      pages: 212,
      language: 'English',
      gutenberg_url: null,
      is_featured: false,
      cover_bg: '#0D1B2A',
      cover_accent: '#4FC3F7',
      cover_text: '#E1F5FE'
    },
    {
      title: 'The Republic',
      author: 'Plato',
      isbn: '978-0-872-20737-0',
      genre: 'Philosophy',
      description: 'One of the most influential works in the history of philosophy, exploring justice, the ideal state, the philosopher-king, and the immortality of the soul.',
      total_copies: 5,
      available_copies: 5,
      published_year: -380,
      pages: 416,
      language: 'English',
      gutenberg_url: 'https://www.gutenberg.org/ebooks/1497',
      is_featured: false,
      cover_bg: '#3B1A5F',
      cover_accent: '#CE93D8',
      cover_text: '#F3E5F5'
    },
    {
      title: 'Steve Jobs',
      author: 'Walter Isaacson',
      isbn: '978-1-451-64853-9',
      genre: 'Biography',
      description: 'Based on more than forty interviews, this is the authoritative biography of the Apple co-founder who was the greatest business executive of our era.',
      total_copies: 4,
      available_copies: 4,
      published_year: 2011,
      pages: 630,
      language: 'English',
      gutenberg_url: null,
      is_featured: false,
      cover_bg: '#1A1A1A',
      cover_accent: '#9E9E9E',
      cover_text: '#FFFFFF'
    },
    {
      title: 'Sherlock Holmes',
      author: 'Arthur Conan Doyle',
      isbn: '978-0-140-43786-3',
      genre: 'Mystery',
      description: 'Sherlock Holmes investigates the mysterious death of Sir Charles Baskerville and the legend of a supernatural hound.' ,
      total_copies: 6,
      available_copies: 6,
      published_year: 1902,
      pages: 256,
      language: 'English',
      gutenberg_url: 'https://www.gutenberg.org/ebooks/2852',
      is_featured: false,
      cover_bg: '#1B2631',
      cover_accent: '#A9CCE3',
      cover_text: '#EBF5FB'
    },
    {
      title: 'Clean Code',
      author: 'Robert C. Martin',
      isbn: '978-0-132-35088-4',
      genre: 'Technology',
      description: 'A handbook of agile software craftsmanship. Martin presents best practices for writing clean code.',
      total_copies: 5,
      available_copies: 5,
      published_year: 2008,
      pages: 431,
      language: 'English',
      gutenberg_url: null,
      is_featured: false,
      cover_bg: '#1A2332',
      cover_accent: '#4CAF50',
      cover_text: '#E8F5E9'
    },
    {
      title: 'The Odyssey',
      author: 'Homer',
      isbn: '978-0-140-44897-5',
      genre: 'Classic Fiction',
      description: "One of the oldest works in Western literature, following Odysseus's ten-year journey home.",
      total_copies: 4,
      available_copies: 4,
      published_year: -800,
      pages: 541,
      language: 'English',
      gutenberg_url: 'https://www.gutenberg.org/ebooks/1727',
      is_featured: false,
      cover_bg: '#5F4A1A',
      cover_accent: '#FFD54F',
      cover_text: '#FFF8E1'
    },
    {
      title: 'Fast and Slow',
      author: 'Daniel Kahneman',
      isbn: '978-0-374-27563-1',
      genre: 'Non-Fiction',
      description: 'Explores the two systems that drive the way we think — Fast and Slow.',
      total_copies: 6,
      available_copies: 6,
      published_year: 2011,
      pages: 499,
      language: 'English',
      gutenberg_url: null,
      is_featured: false,
      cover_bg: '#1A3A5F',
      cover_accent: '#F9A825',
      cover_text: '#FFFDE7'
    },
    {
      title: 'The Selfish Gene',
      author: 'Richard Dawkins',
      isbn: '978-0-192-86092-7',
      genre: 'Science',
      description: 'Dawkins presents a gene-centred view of evolution.',
      total_copies: 5,
      available_copies: 5,
      published_year: 1976,
      pages: 360,
      language: 'English',
      gutenberg_url: null,
      is_featured: false,
      cover_bg: '#3A1A1A',
      cover_accent: '#EF9A9A',
      cover_text: '#FFEBEE'
    },
    {
      title: 'Everyday Things',
      author: 'Don Norman',
      isbn: '978-0-465-06710-7',
      genre: 'Technology',
      description: 'A powerful primer on how design serves as a communication tool.',
      total_copies: 8,
      available_copies: 8,
      published_year: 1988,
      pages: 368,
      language: 'English',
      gutenberg_url: null,
      is_featured: false,
      cover_bg: '#1A2A4A',
      cover_accent: '#80CBC4',
      cover_text: '#E0F2F1'
    },
    {
      title: 'Meditations',
      author: 'Marcus Aurelius',
      isbn: '978-0-140-44140-6',
      genre: 'Philosophy',
      description: 'Personal writings of the Roman Emperor and Stoic philosopher.',
      total_copies: 10,
      available_copies: 10,
      published_year: 180,
      pages: 254,
      language: 'English',
      gutenberg_url: 'https://www.gutenberg.org/ebooks/2680',
      is_featured: false,
      cover_bg: '#2A2A1A',
      cover_accent: '#D4AC0D',
      cover_text: '#FEF9E7'
    },
    {
      title: 'Algorithms',
      author: 'CLRS',
      isbn: '978-0-262-03384-8',
      genre: 'Technology',
      description: 'The definitive reference on algorithms.',
      total_copies: 15,
      available_copies: 15,
      published_year: 1990,
      pages: 1312,
      language: 'English',
      gutenberg_url: null,
      is_featured: false,
      cover_bg: '#1A1F3A',
      cover_accent: '#7986CB',
      cover_text: '#E8EAF6'
    },
    {
      title: 'Pride & Prejudice',
      author: 'Jane Austen',
      isbn: '978-0-141-04959-2',
      genre: 'Classic Fiction',
      description: 'A witty and romantic story of Elizabeth Bennet and Mr. Darcy.',
      total_copies: 8,
      available_copies: 8,
      published_year: 1813,
      pages: 432,
      language: 'English',
      gutenberg_url: 'https://www.gutenberg.org/ebooks/1342',
      is_featured: false,
      cover_bg: '#5F1A3A',
      cover_accent: '#F48FB1',
      cover_text: '#FCE4EC'
    },
    {
      title: 'The Histories',
      author: 'Herodotus',
      isbn: '978-0-140-44634-0',
      genre: 'History',
      description: 'The first great work of history in Western literature.',
      total_copies: 5,
      available_copies: 5,
      published_year: -440,
      pages: 752,
      language: 'English',
      gutenberg_url: 'https://www.gutenberg.org/ebooks/2707',
      is_featured: false,
      cover_bg: '#3A2A1A',
      cover_accent: '#BCAAA4',
      cover_text: '#EFEBE9'
    },
    {
      title: 'Waste Land',
      author: 'T.S. Eliot',
      isbn: '978-0-571-34060-5',
      genre: 'Poetry',
      description: 'A landmark modernist poem exploring themes of disillusionment.',
      total_copies: 4,
      available_copies: 4,
      published_year: 1922,
      pages: 88,
      language: 'English',
      gutenberg_url: 'https://www.gutenberg.org/ebooks/1321',
      is_featured: false,
      cover_bg: '#2A1A3A',
      cover_accent: '#9575CD',
      cover_text: '#EDE7F6'
    },
  ])
  console.log('Books created.')

  // 4. MASSIVE STUDENTS
  const studentNames = [
    'Alice Smith', 'Bob Johnson', 'Charlie Brown', 'Daisy Ridley', 'Edward Norton',
    'Fiona Apple', 'George Harrison', 'Hannah Montana', 'Ian McKellen', 'Jane Austen',
    'Kevin Hart', 'Lila Downs', 'Mark Twain', 'Neil Armstrong', 'Olivia Wilde',
    'Peter Parker', 'Quentin Tarantino', 'Rita Hayworth', 'Steven Spielberg'
  ]
  const studentUsers = []
  for (const name of studentNames) {
    const email = `${name.toLowerCase().replace(' ', '.')}@univ.edu`
    const hashed = await bcrypt.hash('12345678', 12)
    const random = Math.floor(Math.random() * 90000) + 10000
    const cardId = `BV-2026-${random}`
    
    const user = await User.create({
      name,
      email,
      password: hashed,
      role: 'student',
      card_id: cardId,
      status: 'active'
    })
    studentUsers.push(user)
  }
  console.log('Students seeded.')

  // 5. MASSIVE REVIEWS
  const reviewPool = [
    "A absolute masterpiece. Must read!",
    "Incredible depth and character development.",
    "The most influential book I've read this year.",
    "A bit challenging but rewarding.",
    "I'll be thinking about this for a long time.",
    "Excellent academic resource.",
    "The prose is simply beautiful.",
    "Changed my perspective on the subject."
  ]

  for (const book of books) {
    // Each book gets 3-7 random reviews
    const numReviews = Math.floor(Math.random() * 5) + 3
    const reviewers = studentUsers.sort(() => 0.5 - Math.random()).slice(0, numReviews)
    
    for (const student of reviewers) {
      await Review.create({
        user_id: student.id,
        book_id: book.id,
        rating: Math.floor(Math.random() * 2) + 4, // 4-5 stars for massive look
        comment: reviewPool[Math.floor(Math.random() * reviewPool.length)]
      })
    }
  }
  console.log('Reviews seeded.')

  console.log('Database seeding complete.')
}

module.exports = { seedDatabase }
