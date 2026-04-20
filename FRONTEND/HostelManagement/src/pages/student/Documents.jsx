import { useEffect, useState } from "react";
import {
  uploadDocument,
  getDocuments,
} from "../../services/document.service.js";

import {
  Upload,
  FileText,
  CheckCircle,
  AlertCircle,
  ExternalLink,
  RefreshCw,
} from "lucide-react";

const requiredTypes = [
  "address_proof",
  "aadhaar",
  "id_card",
];

const Documents = () => {
  const [file, setFile] =
    useState(null);

  const [type, setType] =
    useState("");

  const [address, setAddress] =
    useState("");

  const [documents, setDocuments] =
    useState([]);

  const [loading, setLoading] =
    useState(false);

  const [fetching, setFetching] =
    useState(true);

  /* ---------------------- */
  /* FETCH DOCS            */
  /* ---------------------- */

  const fetchDocs = async () => {
    try {
      setFetching(true);

      const res =
        await getDocuments();

      setDocuments(
        res.data?.data || []
      );
    } catch (err) {
      console.log(err);
      setDocuments([]);
    } finally {
      setFetching(false);
    }
  };

  useEffect(() => {
    fetchDocs();
  }, []);

  /* ---------------------- */
  /* HELPERS               */
  /* ---------------------- */

  const isUploaded = (
    docType
  ) =>
    documents.some(
      (doc) =>
        doc.type ===
        docType
    );

  const uploadedCount =
    requiredTypes.filter(
      (t) =>
        isUploaded(t)
    ).length;

  const prettyType = (
    text
  ) =>
    text.replace(
      "_",
      " "
    );

  /* ---------------------- */
  /* UPLOAD                */
  /* ---------------------- */

  const handleUpload =
    async () => {
      if (!file || !type) {
        return alert(
          "Please select file and type"
        );
      }

      if (
        isUploaded(type)
      ) {
        return alert(
          `${prettyType(
            type
          )} already uploaded`
        );
      }

      if (
        type ===
          "address_proof" &&
        !address
      ) {
        return alert(
          "Address is required"
        );
      }

      try {
        setLoading(true);

        const formData =
          new FormData();

        formData.append(
          "files",
          file
        );

        formData.append(
          "types",
          type
        );

        formData.append(
          "addresses",
          address || ""
        );

        await uploadDocument(
          formData
        );

        alert(
          "Uploaded successfully!"
        );

        setFile(null);
        setType("");
        setAddress("");

        fetchDocs();
      } catch (err) {
        alert(
          err.response?.data
            ?.message ||
            "Upload failed"
        );
      } finally {
        setLoading(false);
      }
    };

  return (
    <div className="space-y-8">

      {/* Header */}
      <div>
        <h2 className="text-3xl font-bold text-gray-800">
          Documents
        </h2>

        <p className="text-gray-500 mt-1">
          Upload required hostel
          verification documents.
        </p>
      </div>

      {/* Summary Cards */}
      <div className="grid md:grid-cols-3 gap-5">

        <div className="bg-white rounded-2xl shadow p-5">
          <p className="text-sm text-gray-500">
            Required
          </p>

          <p className="text-2xl font-bold mt-1">
            3
          </p>
        </div>

        <div className="bg-white rounded-2xl shadow p-5">
          <p className="text-sm text-gray-500">
            Uploaded
          </p>

          <p className="text-2xl font-bold mt-1 text-green-600">
            {
              uploadedCount
            }
          </p>
        </div>

        <div className="bg-white rounded-2xl shadow p-5">
          <p className="text-sm text-gray-500">
            Pending
          </p>

          <p className="text-2xl font-bold mt-1 text-red-600">
            {3 -
              uploadedCount}
          </p>
        </div>

      </div>

      {/* Required Status */}
      <div className="bg-white rounded-2xl shadow p-6">

        <h3 className="text-xl font-semibold mb-5">
          Required Documents
        </h3>

        <div className="grid md:grid-cols-3 gap-4">

          {requiredTypes.map(
            (t) => {
              const done =
                isUploaded(
                  t
                );

              return (
                <div
                  key={t}
                  className={`rounded-2xl border p-5 ${
                    done
                      ? "bg-green-50 border-green-200"
                      : "bg-red-50 border-red-200"
                  }`}
                >
                  <div className="flex items-center justify-between">

                    <p className="font-medium capitalize">
                      {prettyType(
                        t
                      )}
                    </p>

                    {done ? (
                      <CheckCircle className="text-green-600" size={18} />
                    ) : (
                      <AlertCircle className="text-red-600" size={18} />
                    )}

                  </div>

                  <p className="text-sm mt-2">
                    {done
                      ? "Uploaded"
                      : "Missing"}
                  </p>
                </div>
              );
            }
          )}

        </div>

      </div>

      {/* Upload Form */}
      <div className="bg-white rounded-2xl shadow p-6 space-y-4">

        <div className="flex justify-between items-center">

          <h3 className="text-xl font-semibold">
            Upload Document
          </h3>

          <button
            onClick={
              fetchDocs
            }
            className="text-indigo-600 flex items-center gap-1 text-sm"
          >
            <RefreshCw size={15} />
            Refresh
          </button>

        </div>

        <input
          type="file"
          accept="application/pdf"
          onChange={(e) =>
            setFile(
              e.target
                .files[0]
            )
          }
          className="w-full border rounded-xl px-4 py-3"
        />

        <select
          value={type}
          onChange={(e) =>
            setType(
              e.target
                .value
            )
          }
          className="w-full border rounded-xl px-4 py-3"
        >
          <option value="">
            Select Type
          </option>

          <option value="address_proof">
            Address Proof
          </option>

          <option value="aadhaar">
            Aadhaar
          </option>

          <option value="id_card">
            ID Card
          </option>
        </select>

        {type ===
          "address_proof" && (
          <input
            type="text"
            placeholder="Enter address"
            value={
              address
            }
            onChange={(e) =>
              setAddress(
                e.target
                  .value
              )
            }
            className="w-full border rounded-xl px-4 py-3"
          />
        )}

        <button
          onClick={
            handleUpload
          }
          disabled={
            loading
          }
          className={`w-full py-3 rounded-xl text-white font-semibold flex items-center justify-center gap-2 ${
            loading
              ? "bg-gray-400"
              : "bg-blue-600 hover:bg-blue-700"
          }`}
        >
          <Upload size={18} />

          {loading
            ? "Uploading..."
            : "Upload Document"}
        </button>

      </div>

      {/* Uploaded Docs */}
      <div className="bg-white rounded-2xl shadow overflow-hidden">

        <div className="p-6 border-b">
          <h3 className="text-xl font-semibold">
            Uploaded Documents
          </h3>
        </div>

        {fetching ? (
          <p className="p-6 text-center text-gray-500">
            Loading...
          </p>
        ) : documents.length ===
          0 ? (
          <p className="p-6 text-center text-gray-500">
            No documents uploaded
          </p>
        ) : (
          <div className="divide-y">

            {documents.map(
              (
                doc
              ) => (
                <div
                  key={
                    doc._id
                  }
                  className="flex justify-between items-center p-5 hover:bg-gray-50"
                >

                  <div className="flex items-center gap-3">

                    <FileText className="text-indigo-500" />

                    <div>
                      <p className="font-medium capitalize">
                        {prettyType(
                          doc.type
                        )}
                      </p>

                      {doc.address && (
                        <p className="text-xs text-gray-500">
                          {
                            doc.address
                          }
                        </p>
                      )}
                    </div>

                  </div>

                  <a
                    href={
                      doc.fileUrl
                    }
                    target="_blank"
                    rel="noreferrer"
                    className="text-blue-600 hover:text-blue-700 flex items-center gap-1 text-sm font-medium"
                  >
                    View
                    <ExternalLink size={15} />
                  </a>

                </div>
              )
            )}

          </div>
        )}

      </div>

    </div>
  );
};

export default Documents;