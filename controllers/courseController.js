import Course from '../models/Course.js';

// GET /api/courses
// Supports: ?search=&category=&level=&page=&limit=&sort=
export const getCourses = async (req, res) => {
  const {
    search   = '',
    category = '',
    level    = '',
    page     = 1,
    limit    = 9,
    sort     = 'newest',
    free,
  } = req.query;

  const filter = { isPublished: true };

  // ── Search: title starts with the query (case-insensitive) ──────
  if (search.trim()) {
    filter.title = { $regex: `^${search.trim()}`, $options: 'i' };
  }

  if (category) filter.category = category;
  if (level)    filter.level    = level;
  if (free === 'true') filter.isFree = true;

  const sortMap = {
    newest:   { createdAt: -1 },
    oldest:   { createdAt:  1 },
    popular:  { enrolledCount: -1 },
    rated:    { rating: -1 },
    'price-asc':  { price:  1 },
    'price-desc': { price: -1 },
  };

  const sortQuery = sortMap[sort] || sortMap.newest;
  const skip      = (Number(page) - 1) * Number(limit);

  const [courses, total] = await Promise.all([
    Course.find(filter)
      .sort(sortQuery)
      .skip(skip)
      .limit(Number(limit))
      .lean(),
    Course.countDocuments(filter),
  ]);

  res.json({
    success: true,
    data: {
      courses,
      total,
      page:       Number(page),
      limit:      Number(limit),
      totalPages: Math.ceil(total / Number(limit)),
    },
  });
};

// GET /api/courses/:id
export const getCourseById = async (req, res) => {
  const course = await Course.findById(req.params.id).lean();
  if (!course) {
    return res.status(404).json({ success: false, message: 'Course not found.' });
  }
  res.json({ success: true, data: course });
};

// POST /api/courses
export const createCourse = async (req, res) => {
  const course = await Course.create(req.body);
  res.status(201).json({ success: true, data: course });
};

// PUT /api/courses/:id
export const updateCourse = async (req, res) => {
  const course = await Course.findByIdAndUpdate(
    req.params.id,
    { $set: req.body },
    { new: true, runValidators: true }
  );
  if (!course) {
    return res.status(404).json({ success: false, message: 'Course not found.' });
  }
  res.json({ success: true, data: course });
};

// DELETE /api/courses/:id
export const deleteCourse = async (req, res) => {
  const course = await Course.findByIdAndDelete(req.params.id);
  if (!course) {
    return res.status(404).json({ success: false, message: 'Course not found.' });
  }
  res.json({ success: true, message: 'Course deleted.' });
};