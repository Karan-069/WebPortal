
import { asyncHandler} from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { User } from "../models/user.module.js";
import { UserRole } from "../models/userRole.model.js";
import { Department } from "../models/department.model.js";
import { WorkflowRole } from "../models/workflowRole.model.js";


const generateAccessTokenAndRefreshTokens = async(userId) => {
    try {
        const user = await User.findById(userId);
        // Generating Token using User Module Methods
        const accessToken = user.generateAccessToken();
        const refreshToken = user.generateRefreshToken();

        //Setting refresh Token value in User
        user.refreshToken = refreshToken;
        //Save in DB against User
        await user.save({ validateBeforeSave : false });

        return { accessToken , refreshToken }

    } catch (error) {
        throw new ApiError(500, error?.message || "Error while Generating Tokens !!")
    }
};

const registerUser = asyncHandler(async(req, res) =>{

    const {email, fullName, userRole, workflowRole, department, password, accessType } = req.body

    //Checking Null by Triming Fields
    if(
        [email, fullName, userRole, workflowRole, department, password, accessType].some(field => field.trim() == "")
    ){
        throw new ApiError(400, "All Fields are Mandatory!!")
    }

    //Check Ac
    if(accessType !== "user"){
        throw new ApiError(400, "Acess Type must be 'User'!!")
    }

    //Check User If Exists in DB
    const checkEmail = await User.findOne({email});
    if(checkEmail){
        throw new ApiError(409, "User Already Exists with Email !!")
    }

    //Checking Other Schemms Id and isAsctive

    const [getUserRole, getDepartment, getWorkflowRole] = await Promise.all([
        UserRole.findById(userRole),
        Department.findById(department),
        WorkflowRole.findById(workflowRole)
    ])

    if(!getUserRole || !getUserRole.isActive){
        throw new ApiError(400, "User Role does not Exists or is InActive!!")
    }
    if(!getDepartment || !getDepartment.isActive){
        throw new ApiError(400, "Department does not exits or is InActive !!")
    }
    if (!getWorkflowRole || !getWorkflowRole.isActive) {
        throw new ApiError(400, "Workflow Role does not exists or is InActive!!")
    }


    const newUser = await User.create({
        email,
        fullName,
        password,
        userRole,
        department,
        workflowRole,
        accessType
    })

    const getNewuser = await User.findById(newUser._id).select("-password -refreshToken")

    if(!getNewuser){
        throw new ApiError(500, "An Error Occured while Registering User!!")
    }

    //Return res

    return res.status(201).json(
        new ApiResponse(
            200,
            getNewuser,
            "User Sucessfully Registerd!!"

        )
    )

});


const loginUser = asyncHandler(async(req, res)=>{

    const {email, password} = req.body

    const user = await User.findOne({ email })
    if(!user){
        throw new ApiError(404, "Invalid Email or Password!!")
    };

    const isPasswordValid = await user.isPasswordCorrect(password)
    if(!isPasswordValid){
        throw new ApiError(401, "Invalid Email or Password!!")
    };

    //Gentrate Access 
    const { accessToken, refreshToken } = await generateAccessTokenAndRefreshTokens(user._id);

    const UpdatedUser = await User.findById(user._id).select("-password -refreshToken");

    const options = {
        httpOnly: true,
        secure: true,
        sameSite: "Strict"
    };

    //Returning Status
    return res
        .status(200)
        .cookie("accessToken", accessToken, options)// Setting cookie
        .cookie("refreshToken", refreshToken, options)// Seting cookie
        .json(
            new ApiResponse(
                    200,
                    {
                    user: UpdatedUser, accessToken
                    },
                "User Sucessfully Logged In !!"
            )
        )
});



export {
    registerUser,
    loginUser
}