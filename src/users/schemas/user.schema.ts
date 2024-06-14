// Import Schema and Document from the mongoose package
import { Schema, Document } from 'mongoose';

// Define the User schema with mongoose
export const UserSchema = new Schema({
  userId: { type: String, unique: true },
  // Define the email field as a required string
  email: { type: String, required: true },
  // Define the avatar field as an optional string
  avatar: String,
  // Define the avatarHash field as an optional string
  avatarHash: String,
});

// Define a TypeScript interface for the User document extending mongoose Document
export interface User extends Document {
  userId: string; // userId is optional in TypeScript interface
  // Define the email field as a string
  email: string;
  // Define the avatar field as an optional string
  avatar?: string;
  // Define the avatarHash field as an optional string
  avatarHash?: string;
}
