// import { Request, Response } from "express";
// import catchAsync from "../../../shared/catchAsync";
// import { SubscriptionService } from "./subscription.service";
// import sendResponse from "../../../shared/sendResponse";
// import { StatusCodes } from "http-status-codes";

// const subscriptions = catchAsync( async(req: Request, res: Response)=>{
//     const result = await SubscriptionService.subscriptionsFromDB(req.query);

//     sendResponse(res, {
//         statusCode: StatusCodes.OK,
//         success: true,
//         message: "Subscription List Retrieved Successfully",
//         data: result
//     })
// });

// const subscriptionDetails = catchAsync( async(req: Request, res: Response)=>{
//     if (!req.user) {
//         return res.status(StatusCodes.UNAUTHORIZED).json({
//             success: false,
//             message: "Unauthorized: User not found",
//         });
//     }
//     const result = await SubscriptionService.subscriptionDetailsFromDB(req.user);

//     sendResponse(res, {
//         statusCode: StatusCodes.OK,
//         success: true,
//         message: "Subscription Details Retrieved Successfully",
//         data: result
//     })
// });

// export const SubscriptionController = {
//     subscriptions,
//     subscriptionDetails
// }