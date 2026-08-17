import { body } from "express-validator";

export const joinPoolValidator = [
  body("name")
    .trim()
    .notEmpty()
    .withMessage("Name is required")
    .isLength({ max: 50 })
    .withMessage("Name must be 50 characters or less"),

  body("phone")
    .matches(/^[6-9]\d{9}$/)
    .withMessage("Invalid phone number"),

  body("items")
    .isArray({ min: 1 })
    .withMessage("At least one item is required"),

  body("items.*.itemName")
    .trim()
    .notEmpty()
    .withMessage("Item name is required")
    .isLength({ max: 100 })
    .withMessage("Item name must be 100 characters or less"),

  body("items.*.price")
    .isFloat({ min: 0.01, max: 100000 })
    .withMessage("Price must be between ₹0.01 and ₹100000"),

  body("items.*.quantity")
    .isInt({ min: 1, max: 100 })
    .withMessage("Quantity must be between 1 and 100"),
];