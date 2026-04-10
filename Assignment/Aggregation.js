
//Calculate average GPA by department
const avgGPAByDepartment = async () => {
  return await Student.aggregate([
    // Only include students with a department
    { $match: { department: { $exists: true, $ne: null } } },
    {
      $group: {
        _id: '$department',
        averageGPA: { $avg: '$gpa' },
        studentCount: { $sum: 1 },
        highestGPA: { $max: '$gpa' },
        lowestGPA:  { $min: '$gpa' }
      }
    },
    {
      $project: {
        department: '$_id',
        averageGPA: { $round: ['$averageGPA', 2] },
        studentCount: 1,
        highestGPA: 1,
        lowestGPA: 1,
        _id: 0
      }
    },
    { $sort: { averageGPA: -1 } }
  ]);
};

// Find most popular courses
const mostPopularCourses = async () => {
  return await Student.aggregate([
    // Unwind courses array so each course becomes its own doc
    { $unwind: '$courses' },
    {
      $group: {
        _id: '$courses',
        enrollmentCount: { $sum: 1 },
        avgStudentGPA: { $avg: '$gpa' }
      }
    },
    {
      $project: {
        courseCode: '$_id',
        enrollmentCount: 1,
        avgStudentGPA: { $round: ['$avgStudentGPA', 2] },
        _id: 0
      }
    },
    { $sort: { enrollmentCount: -1 } },
    { $limit: 10 }
  ]);
};

// Generate student performance report
const studentPerformanceReport = async () => {
  return await Student.aggregate([
    {
      $project: {
        name: 1,
        email: 1,
        gpa: 1,
        courseCount: { $size: '$courses' },
        status: 1,
        enrollmentDate: 1,
        performanceTier: {
          $switch: {
            branches: [
              { case: { $gte: ['$gpa', 3.8] }, then: 'Distinction' },
              { case: { $gte: ['$gpa', 3.5] }, then: 'Honours'     },
              { case: { $gte: ['$gpa', 3.0] }, then: 'Good Standing'},
              { case: { $gte: ['$gpa', 2.0] }, then: 'Average'     }
            ],
            default: 'Academic Probation'
          }
        }
      }
    },
    {
      $group: {
        _id: '$performanceTier',
        students: {
          $push: { name: '$name', email: '$email', gpa: '$gpa' }
        },
        count: { $sum: 1 },
        avgGPA: { $avg: '$gpa' }
      }
    },
    {
      $project: {
        tier: '$_id',
        students: 1,
        count: 1,
        avgGPA: { $round: ['$avgGPA', 2] },
        _id: 0
      }
    },
    { $sort: { avgGPA: -1 } }
  ]);
};