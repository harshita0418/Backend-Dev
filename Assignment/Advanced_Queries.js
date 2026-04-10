
//1. Students with GPA between 3.0 and 3.5
const findMidRangeGPA = async () => {
  const students = await Student.find({
    gpa: { $gte: 3.0, $lte: 3.5 }
  }).select('name email gpa').sort({ gpa: -1 });
  console.log(`Found ${students.length} students`);
  return students;
};


// Find students enrolled in more than 5 courses
const findHeavyEnrollment = async () => {
  const students = await Student.find({
    $expr: { $gt: [{ $size: '$courses' }, 5] }
  }).select('name email courses');
  return students;
};

// Alternative using aggregation (more flexible)
const findHeavyEnrollmentAgg = async () => {
  return await Student.aggregate([
    { $addFields: { courseCount: { $size: '$courses' } } },
    { $match: { courseCount: { $gt: 5 } } },
    { $project: { name: 1, email: 1, courseCount: 1 } }
  ]);
};

// Get top 10 students by GPA
const getTop10ByGPA = async () => {
  const students = await Student.find()
    .select('name email gpa')
    .sort({ gpa: -1 })
    .limit(10)
    .lean();
  return students;
};

// Count students by city
const countByCity = async () => {
  const result = await Student.aggregate([
    {
      $group: {
        _id: '$address.city',
        count: { $sum: 1 },
        avgGPA: { $avg: '$gpa' }
      }
    },
    { $sort: { count: -1 } },
    {
      $project: {
        city: '$_id',
        count: 1,
        avgGPA: { $round: ['$avgGPA', 2] },
        _id: 0
      }
    }
  ]);
  console.log('Students by city:', result);
  return result;
};