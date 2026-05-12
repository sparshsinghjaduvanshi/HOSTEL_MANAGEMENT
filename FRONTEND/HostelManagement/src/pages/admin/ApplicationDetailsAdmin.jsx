import {
  useEffect,
  useState
} from "react";

import {
  useParams
} from "react-router-dom";

import {
  getApplicationDetails
} from "../../services/admin.service.js";

import ApplicationDetailsPage
from "../../components/common/ApplicationDetailsPage.jsx";

export default function ApplicationDetails() {

  const { id } = useParams();

  const [application, setApplication] =
    useState(null);

  const [documents, setDocuments] =
    useState([]);

  const [loading, setLoading] =
    useState(true);

  const fetchDetails =
    async () => {

      try {

        const res =
          await getApplicationDetails(id);

        setApplication(
          res.data.data.application
        );

        setDocuments(
          res.data.data.documents
        );

      } catch (err) {

        console.log(err);

      } finally {

        setLoading(false);
      }
    };

  useEffect(() => {

    fetchDetails();

  }, []);

  if (loading) {

    return (
      <div className="p-6">
        Loading...
      </div>
    );
  }

  if (!application) {

    return (
      <div className="p-6">
        Application not found
      </div>
    );
  }

  return (

    <ApplicationDetailsPage
      application={application}
      documents={documents}
    />

  );
}