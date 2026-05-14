// 'use client'

// import { useEffect, useState } from 'react'
// import { motion } from 'framer-motion'
// import { Search } from 'lucide-react'
// import Link from 'next/link'
// import { createClient } from '@/lib/supabase/client'
// import { StudentCard } from '@/components/student-card'

// interface Student {
//   id: string
//   name: string
//   department: string
//   photo_url?: string
//   bio?: string
// }

// export default function DirectoryPage() {
//   const [students, setStudents] = useState<Student[]>([])
//   const [filteredStudents, setFilteredStudents] = useState<Student[]>([])
//   const [searchTerm, setSearchTerm] = useState('')
//   const [selectedDepartment, setSelectedDepartment] = useState<string>('all')
//   const [departments, setDepartments] = useState<string[]>([])
//   const [loading, setLoading] = useState(true)

//   const supabase = createClient()

//   useEffect(() => {
//     async function fetchStudents() {
//       const { data, error } = await supabase
//         .from('students')
//         .select('*')
//         .order('name')

//       if (error) {
//         console.error('Error fetching students:', error)
//       } else {
//         setStudents(data || [])
//         // Extract unique departments
//         const depts = [...new Set((data || []).map(s => s.department))]
//         setDepartments(depts as string[])
//       }
//       setLoading(false)
//     }

//     fetchStudents()
//   }, [supabase])

//   useEffect(() => {
//     let filtered = students

//     // Filter by search term
//     if (searchTerm) {
//       filtered = filtered.filter(
//         s => s.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
//              s.bio?.toLowerCase().includes(searchTerm.toLowerCase())
//       )
//     }

//     // Filter by department
//     if (selectedDepartment !== 'all') {
//       filtered = filtered.filter(s => s.department === selectedDepartment)
//     }

//     setFilteredStudents(filtered)
//   }, [searchTerm, selectedDepartment, students])

//   return (
//     <main className="min-h-screen bg-black text-white">
//       {/* Header */}
//       <div className="bg-black-secondary border-b border-gold/20">
//         <div className="max-w-7xl mx-auto px-4 py-12">
//           <Link href="/" className="text-gold hover:text-yellow-400 mb-6 inline-block text-sm">
//             ← Back Home
//           </Link>
//           <h1 className="font-serif text-4xl font-bold text-white mb-2">
//             Celebrate Our <span className="text-gold">Graduates</span>
//           </h1>
//           <p className="text-gray-400">Browse and connect with your classmates</p>
//         </div>
//       </div>

//       {/* Content */}
//       <div className="max-w-7xl mx-auto px-4 py-12">
//         {/* Search and Filters */}
//         <div className="mb-12">
//           {/* Search */}
//           <div className="relative mb-6">
//             <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gold" size={20} />
//             <input
//               type="text"
//               placeholder="Search by name or bio..."
//               value={searchTerm}
//               onChange={(e) => setSearchTerm(e.target.value)}
//               className="w-full pl-12 pr-4 py-3 bg-black-secondary border border-gold/30 rounded-lg text-white placeholder-gray-500 focus:border-gold focus:outline-none transition-colors"
//             />
//           </div>

//           {/* Department Filter */}
//           {departments.length > 0 && (
//             <div className="flex flex-wrap gap-2">
//               <button
//                 onClick={() => setSelectedDepartment('all')}
//                 className={`px-4 py-2 rounded-lg font-semibold transition-colors ${
//                   selectedDepartment === 'all'
//                     ? 'bg-gold text-black'
//                     : 'bg-black-secondary border border-gold/30 text-gold hover:border-gold'
//                 }`}
//               >
//                 All Departments
//               </button>
//               {departments.map(dept => (
//                 <button
//                   key={dept}
//                   onClick={() => setSelectedDepartment(dept)}
//                   className={`px-4 py-2 rounded-lg font-semibold transition-colors ${
//                     selectedDepartment === dept
//                       ? 'bg-gold text-black'
//                       : 'bg-black-secondary border border-gold/30 text-gold hover:border-gold'
//                   }`}
//                 >
//                   {dept}
//                 </button>
//               ))}
//             </div>
//           )}
//         </div>

//         {/* Results count */}
//         <div className="text-gray-400 mb-8">
//           Showing {filteredStudents.length} of {students.length} graduates
//         </div>

//         {/* Student Grid */}
//         {loading ? (
//           <div className="flex items-center justify-center h-64">
//             <div className="text-gold text-lg">Loading graduates...</div>
//           </div>
//         ) : filteredStudents.length === 0 ? (
//           <div className="text-center py-20">
//             <div className="text-4xl mb-4">🔍</div>
//             <p className="text-gray-400 text-lg">No graduates found matching your search.</p>
//           </div>
//         ) : (
//           <motion.div
//             className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6"
//             initial={{ opacity: 0 }}
//             animate={{ opacity: 1 }}
//             transition={{ duration: 0.5 }}
//           >
//             {filteredStudents.map((student, index) => (
//               <motion.div
//                 key={student.id}
//                 initial={{ opacity: 0, y: 20 }}
//                 animate={{ opacity: 1, y: 0 }}
//                 transition={{ duration: 0.3, delay: index * 0.05 }}
//               >
//                 <StudentCard student={student} />
//               </motion.div>
//             ))}
//           </motion.div>
//         )}
//       </div>
//     </main>
//   )
// }
