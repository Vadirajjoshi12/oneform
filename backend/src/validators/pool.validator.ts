import { body } from "express-validator";

export const createPoolValidator = [

  body("communityId")
    .trim()
    .notEmpty()
    .withMessage("Community is required"),

  body("platform")
    .isIn([
      "Blinkit",
      "Zepto",
      "Instamart",
      "Swiggy",
    ])
    .withMessage("Invalid platform"),

  body("pickupLocation")
    .trim()
    .notEmpty()
    .isLength({ max: 150 }),

  body("radiusKm")
    .isFloat({
      min: 0.5,
      max: 2,
    }),

  body("durationMinutes")
    .isInt({
      min: 5,
      max: 120,
    }),

  body("targetThreshold")
    .isFloat({
      min: 1,
    }),

  body("note")
    .optional()
    .isLength({
      max: 300,
    }),

  body("host.name")
    .trim()
    .notEmpty()
    .isLength({
      max: 50,
    }),

  body("host.phone")
    .matches(/^[6-9]\d{9}$/)
    .withMessage("Invalid phone number"),

  body("item.name")
    .trim()
    .notEmpty(),

  body("item.price")
    .isFloat({
      min: 1,
    }),

  body("item.quantity")
    .isInt({
      min: 1,
    }),

  body("location.lat")
    .isFloat(),

  body("location.lng")
    .isFloat()

];