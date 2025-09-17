const Request = require("../../models/Request");
const User = require("../../models/User");
const appError = require("../../utils/appError");
const catchAsync = require("../../utils/errorHandlers").catchAsync;
const { USER_POPULATE_FIELDS } = require("../../utils/userPopulateFields");
const {
  calculateNextEligibleDonation,
  checkDonationEligibility,
} = require("../../utils/donationUtils");

exports.getAllRequests = catchAsync(async (req, res, next) => {
  if (!req.user.role.staff || !req.user.staff_approval) {
    return next(
      new appError("You do not have permission to access this resource", 403)
    );
  }

  const filter = {};

  if (req.query.type) filter.type = req.query.type;
  if (req.query.status) filter.status = req.query.status;
  if (req.query.bloodType) filter.bloodType = req.query.bloodType;
  if (req.query.urgency) filter.urgency = req.query.urgency;
  if (req.query.userId) filter.userId = req.query.userId;

  if (req.query.requestId) filter.requestId = req.query.requestId;

  if (req.query.userEmail) {
    try {
      const User = require("../../models/User");
      const user = await User.findOne({
        email: { $regex: new RegExp(req.query.userEmail, "i") },
      });
      if (user) {
        filter.userId = user.userId;
      } else {
        filter.userId = "no-match-found";
      }
    } catch (err) {
      console.error("Error searching by email:", err);
    }
  }

  const requests = await Request.find(filter)
    .populate("userObjectId", USER_POPULATE_FIELDS)
    .sort({ urgency: -1, createdAt: -1 });

  res.status(200).json({
    status: "success",
    count: requests.length,
    data: requests,
  });
});

exports.getRequestById = catchAsync(async (req, res, next) => {
  if (!req.user.role.staff || !req.user.staff_approval) {
    return next(
      new appError("You do not have permission to access this resource", 403)
    );
  }

  let request = await Request.findById(req.params.id).populate(
    "userObjectId",
    USER_POPULATE_FIELDS
  );

  if (!request) {
    request = await Request.findOne({ requestId: req.params.id }).populate(
      "userObjectId",
      USER_POPULATE_FIELDS
    );
  }

  if (!request) {
    return next(new appError("No request found with that ID", 404));
  }

  res.status(200).json({
    status: "success",
    data: request,
  });
});

exports.updateRequestStatus = catchAsync(async (req, res, next) => {
  if (!req.user.role.staff || !req.user.staff_approval) {
    return next(
      new appError("You do not have permission to access this resource", 403)
    );
  }

  const { status, rejectionReason } = req.body;

  if (
    ![
      "pending",
      "completed",
      "rejected",
      "matched",
      "fulfilled",
      "cancelled",
    ].includes(status)
  ) {
    return next(new appError("Invalid status value", 400));
  }

  if (status === "rejected" && !rejectionReason) {
    return next(
      new appError("Rejection reason is required when rejecting a request", 400)
    );
  }

  const updateData = { status };
  if (rejectionReason) {
    updateData.rejectionReason = rejectionReason;
  }

  let updatedRequest = await Request.findByIdAndUpdate(
    req.params.id,
    updateData,
    { new: true, runValidators: true }
  ).populate("userObjectId", USER_POPULATE_FIELDS);

  if (!updatedRequest) {
    updatedRequest = await Request.findOneAndUpdate(
      { requestId: req.params.id },
      updateData,
      { new: true, runValidators: true }
    ).populate("userObjectId", USER_POPULATE_FIELDS);
  }

  if (!updatedRequest) {
    return next(new appError("No request found with that ID", 404));
  }

  if (status === "completed" && updatedRequest.isForSelf) {
    try {
      const currentDate = new Date();
      const donationType = updatedRequest.type;

      const User = require("../../models/User");
      const existingUser = await User.findById(updatedRequest.userObjectId);

      const user = await User.findOne({ userId: updatedRequest.userId });
      console.log("Found user:", user ? "YES" : "NO");

      if (user && user.lastDonation) {
        const eligibility = checkDonationEligibility(
          donationType,
          user.lastDonation
        );
        if (!eligibility.isEligible) {
          console.warn(
            `Warning: User ${
              updatedRequest.userId
            } may not be eligible for ${donationType} donation yet. Last donation: ${user.lastDonation.toLocaleDateString()}, Next eligible: ${eligibility.nextEligibleDate.toLocaleDateString()}`
          );
        }
      }

      const nextEligibleDate = calculateNextEligibleDonation(
        donationType,
        currentDate
      );

      const userToUpdate = await User.findOne({
        userId: updatedRequest.userId,
      });

      if (!userToUpdate) {
        console.error("User not found with userId:", updatedRequest.userId);
        throw new Error("User not found");
      }


      userToUpdate.lastDonation = currentDate;
      userToUpdate.nextEligibleDonation = nextEligibleDate;


      const savedUser = await userToUpdate.save();
    } catch (userUpdateError) {
      console.error("Error updating user lastDonation:", userUpdateError);
    }
  } 

  try {
    const notificationUtils = require("../../utils/notificationUtils");

    const notificationData = notificationUtils.createRequestStatusNotification(
      status,
      updatedRequest.requestId,
      updatedRequest.type,
      rejectionReason
    );

    await notificationUtils.addStaffNotification(
      updatedRequest.userId,
      notificationData,
      req.user
    );

  } catch (notifError) {
    console.error("Error sending request status notification:", notifError);
  }

  res.status(200).json({
    status: "success",
    data: updatedRequest,
  });

});
