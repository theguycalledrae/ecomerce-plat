import mongoose from "mongoose";

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Name is required"],
      trim: true,
      minlength: [2, "Name must be at least 2 characters"],
      maxlength: [60, "Name must be at most 60 characters"],
    },
    email: {
      type: String,
      required: [true, "Email is required"],
      unique: true,
      lowercase: true,
      trim: true,
      match: [/^\S+@\S+\.\S+$/, "Invalid email format"],
    },
    // select: false keeps the hash out of every default query.
    passwordHash: {
      type: String,
      required: [true, "Password is required"],
      select: false,
    },
    role: {
      type: String,
      enum: ["customer", "admin"],
      default: "customer",
    },
    image: {
      type: String,
      trim: true,
      maxlength: [255, "Image cannot exceed 255 characters"],
      default: null,
    },
    dateOfBirth: {
      type: Date,
      validate: {
        validator: function(v) {
          if (v === null || v === undefined) return true;
          if (!(v instanceof Date) || isNaN(v.getTime())) return false;
          const now = new Date();
          if (v > now) return false;
          const minDate = new Date();
          minDate.setFullYear(now.getFullYear() - 150);
          if (v < minDate) return false;
          const minAgeDate = new Date();
          minAgeDate.setFullYear(now.getFullYear() - 13);
          if (v > minAgeDate) return false;
          return true;
        },
        message: props => `${props.value} is not a valid date of birth! Must be a past date, at least 13 years ago, and not older than 150 years.`,
      },
    },
  },
  { timestamps: true }
);

export default mongoose.model("User", userSchema);
