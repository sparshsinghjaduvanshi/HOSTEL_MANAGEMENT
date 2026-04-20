import { useEffect, useMemo, useState } from "react";
import {
  getAllStudents,
  deleteStudent,
  getStudentDocuments,
} from "../../services/admin.service.js";

import {
  Search,
  RefreshCw,
  Users,
  Mail,
  Phone,
  BadgeInfo,
  Trash2,
  FileText,
  X,
} from "lucide-react";

const Students = () => {
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  const [selectedStudent, setSelectedStudent] =
    useState(null);

  const [documents, setDocuments] =
    useState([]);

  const [docLoading, setDocLoading] =
    useState(false);

  const fetchStudents = async () => {
    try {
      setLoading(true);

      const res =
        await getAllStudents();

      setStudents(
        res.data.data || []
      );
    } catch (err) {
      alert(
        "Failed to fetch students"
      );
      setStudents([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStudents();
  }, []);

  const handleDelete = async (
    id
  ) => {
    if (
      !window.confirm(
        "Deactivate student?"
      )
    )
      return;

    try {
      await deleteStudent(id);

      alert(
        "Student deactivated"
      );

      fetchStudents();

      if (
        selectedStudent
          ?.userId?._id === id
      ) {
        closeModal();
      }
    } catch (err) {
      alert(
        err.response?.data
          ?.message ||
          "Delete failed"
      );
    }
  };

  const openStudent =
    async (student) => {
      try {
        setSelectedStudent(
          student
        );

        setDocLoading(true);
        setDocuments([]);

        const res =
          await getStudentDocuments(
            student._id
          );

        setDocuments(
          res.data.data || []
        );
      } catch {
        alert(
          "Failed to load documents"
        );
      } finally {
        setDocLoading(false);
      }
    };

  const closeModal = () => {
    setSelectedStudent(null);
    setDocuments([]);
  };

  const filteredStudents =
    useMemo(() => {
      const q =
        search
          .toLowerCase()
          .trim();

      return students.filter(
        (s) => {
          const name =
            s.userId?.fullName
              ?.toLowerCase() ||
            "";

          const email =
            s.userId?.email
              ?.toLowerCase() ||
            "";

          const enroll =
            s.enrollmentNo
              ?.toLowerCase() ||
            "";

          return (
            name.includes(q) ||
            email.includes(q) ||
            enroll.includes(q)
          );
        }
      );
    }, [students, search]);

  return (
    <div className="space-y-8">

      {/* Header */}
      <div className="flex justify-between items-center">

        <div>
          <h2 className="text-3xl font-bold">
            Students Management
          </h2>

          <p className="text-gray-500">
            Manage all students
          </p>
        </div>

        <button
          onClick={
            fetchStudents
          }
          className="px-4 py-2 bg-indigo-600 text-white rounded-xl flex gap-2"
        >
          <RefreshCw size={18} />
          Refresh
        </button>

      </div>

      {/* Search */}
      <div className="flex items-center bg-white border rounded-xl px-4">

        <Search
          size={18}
          className="text-gray-400"
        />

        <input
          value={search}
          onChange={(e) =>
            setSearch(
              e.target.value
            )
          }
          placeholder="Search students..."
          className="w-full py-3 px-3 outline-none"
        />

      </div>

      {/* Cards */}
      {loading ? (
        <p className="text-center py-10">
          Loading...
        </p>
      ) : filteredStudents.length ===
        0 ? (
        <p className="text-center py-10 text-gray-500">
          No students found
        </p>
      ) : (
        <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-6">

          {filteredStudents.map(
            (s) => {
             const active = Boolean(s.userId?.isActive);

              return (
                <div
                  key={s._id}
                  onClick={() =>
                    openStudent(
                      s
                    )
                  }
                  className="bg-white rounded-2xl shadow p-6 cursor-pointer hover:shadow-xl"
                >

                  <div className="flex justify-between">

                    <div>
                      <h3 className="font-bold text-lg">
                        {
                          s
                            .userId
                            ?.fullName
                        }
                      </h3>

                      <p className="text-sm text-gray-500">
                        {
                          s
                            .userId
                            ?.email
                        }
                      </p>
                    </div>

                    <Users className="text-indigo-600" />

                  </div>

                  <div className="mt-4 space-y-2 text-sm">

                    <p>
                      <Phone size={14} className="inline" />{" "}
                      {s.phone}
                    </p>

                    <p>
                      <BadgeInfo size={14} className="inline" />{" "}
                      {
                        s.enrollmentNo
                      }
                    </p>

                  </div>

                  <div className="mt-5 flex justify-between items-center">

                    <span
                      className={`px-3 py-1 text-xs rounded-full ${
                        active
                          ? "bg-green-100 text-green-700"
                          : "bg-red-100 text-red-700"
                      }`}
                    >
                      {active
                        ? "Active"
                        : "Inactive"}
                    </span>

                    {active && (
                      <button
                        onClick={(
                          e
                        ) => {
                          e.stopPropagation();

                          handleDelete(
                            s
                              .userId
                              ?._id
                          );
                        }}
                        className="text-red-600"
                      >
                        <Trash2 size={18} />
                      </button>
                    )}

                  </div>

                </div>
              );
            }
          )}

        </div>
      )}

      {/* Modal */}
      {selectedStudent && (
        <div className="fixed inset-0 bg-black/40 flex justify-center items-center z-50 p-4">

          <div className="bg-white rounded-2xl p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">

            <div className="flex justify-between mb-6">

              <h3 className="text-2xl font-bold">
                {
                  selectedStudent
                    .userId
                    ?.fullName
                }
              </h3>

              <button
                onClick={
                  closeModal
                }
              >
                <X />
              </button>

            </div>

            {docLoading ? (
              <p>
                Loading docs...
              </p>
            ) : documents.length ===
              0 ? (
              <p>
                No documents uploaded
              </p>
            ) : (
              <div className="space-y-3">

                {documents.map(
                  (
                    doc
                  ) => (
                    <div
                      key={
                        doc._id
                      }
                      className="flex justify-between bg-gray-50 p-4 rounded-xl"
                    >

                      <span className="capitalize">
                        {
                          doc.type
                        }
                      </span>

                      <a
                        href={
                          doc.fileUrl
                        }
                        target="_blank"
                        rel="noreferrer"
                        className="text-blue-600"
                      >
                        View
                      </a>

                    </div>
                  )
                )}

              </div>
            )}

          </div>

        </div>
      )}

    </div>
  );
};

export default Students;