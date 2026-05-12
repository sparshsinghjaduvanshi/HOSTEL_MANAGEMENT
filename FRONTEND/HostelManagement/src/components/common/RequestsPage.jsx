export default function RequestsPage({

    complaints,

    roomChanges,

    title = "Requests"

}) {

    return (

        <div className="space-y-6">

            {/* HEADER */}

            <div>

                <h1 className="text-3xl font-bold">
                    {title}
                </h1>

                <p className="text-gray-500 mt-1">

                    Manage complaints and room
                    change requests.

                </p>

            </div>

            {/* COMPLAINTS */}

            <div className="space-y-4">

                <h2 className="text-2xl font-semibold">

                    Complaints

                </h2>

                {
                    complaints.length === 0 ? (

                        <div
                            className="
                bg-white
                rounded-2xl
                shadow
                border
                p-5
                text-gray-500
              "
                        >

                            No complaints found.

                        </div>

                    ) : (

                        complaints.map((c) => (

                            <div
                                key={c._id}
                                className="
                  bg-white
                  rounded-2xl
                  shadow
                  border
                  p-5
                "
                            >

                                <div
                                    className="
                    flex
                    justify-between
                  "
                                >

                                    <div>

                                        <h2 className="font-semibold">

                                            {
                                                r.requester
                                                    ?.userId
                                                    ?.fullName
                                            }

                                        </h2>

                                        <p className="text-gray-500">

                                            {
                                                
                                                    r.type === "swap"
                                                        ? "Room Swap Request"
                                                        : "Single Room Change"
                                                
                                            }

                                        </p>

                                    </div>

                                    <span
                                        className="
                      px-3
                      py-1
                      rounded-full
                      bg-yellow-100
                      text-yellow-700
                      text-sm
                    "
                                    >

                                        {c.status}

                                    </span>

                                </div>

                                <p className="mt-4 text-gray-700">

                                    {c.description}

                                </p>

                            </div>
                        ))
                    )
                }

            </div>

            {/* ROOM CHANGES */}

            <div className="space-y-4">

                <h2 className="text-2xl font-semibold">

                    Room Change Requests

                </h2>

                {
                    roomChanges.length === 0 ? (

                        <div
                            className="
                bg-white
                rounded-2xl
                shadow
                border
                p-5
                text-gray-500
              "
                        >

                            No room change requests.

                        </div>

                    ) : (

                        roomChanges.map((r) => (

                            <div
                                key={r._id}
                                className="
                  bg-white
                  rounded-2xl
                  shadow
                  border
                  p-5
                "
                            >

                                <div
                                    className="
                    flex
                    justify-between
                  "
                                >

                                    <div>

                                        <h2 className="font-semibold">

                                            {
                                                r.studentId
                                                    ?.userId
                                                    ?.fullName
                                            }

                                        </h2>

                                        <p className="text-gray-500">

                                            {
                                                r.requestType
                                            }

                                        </p>

                                    </div>

                                    <span
                                        className="
                      px-3
                      py-1
                      rounded-full
                      bg-blue-100
                      text-blue-700
                      text-sm
                    "
                                    >

                                        {r.status}

                                    </span>

                                </div>

                                <p className="mt-4 text-gray-700">

                                    {r.reason}

                                </p>

                            </div>
                        ))
                    )
                }

            </div>

        </div>
    );
}