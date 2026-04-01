import {Student} from "../models/student.model"
import {Admin} from "../models/admin.model"
import {User} from "../models/user.model"

const deleteUserPermanently = async (userId) => {
    // delete related data first
    await Student.deleteOne({ userId });
    await Admin.deleteOne({ userId });
    await Staff.deleteOne({ userId });

    // delete user
    await User.findByIdAndDelete(userId);
};

export { deleteUserPermanently };