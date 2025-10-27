import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type UserDocument = User & Document;

@Schema({
  collection: 'users',
  timestamps: true, // adds createdAt/updatedAt
  versionKey: false,
})
export class User {
  @Prop({
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true,
    index: true,
  })
  email: string;

  @Prop({
    type: String,
    required: true,
    minlength: 60, // bcrypt hash length
    select: false, // exclude from queries unless explicitly asked
  })
  passwordHash: string;

  @Prop({
    type: String,
    enum: ['USER', 'ADMIN'],
    default: 'USER',
    index: true,
  })
  role: 'USER' | 'ADMIN';

  @Prop({
    type: Boolean,
    default: true,
  })
  isActive: boolean;

  @Prop({
    type: {
      firstName: { type: String, trim: true },
      lastName: { type: String, trim: true },
      phone: { type: String, trim: true },
      address: {
        line1: { type: String, trim: true },
        line2: { type: String, trim: true },
        city: { type: String, trim: true },
        state: { type: String, trim: true },
        postal: { type: String, trim: true },
        country: { type: String, trim: true },
      },
    },
    _id: false,
  })
  profile?: {
    firstName?: string;
    lastName?: string;
    phone?: string;
    address?: {
      line1?: string;
      line2?: string;
      city?: string;
      state?: string;
      postal?: string;
      country?: string;
    };
  };

  @Prop({
    type: [String],
    default: [],
  })
  notificationPreferences: string[];

  @Prop({
    type: {
      accessToken: { type: String },
      refreshToken: { type: String },
      expiresAt: { type: Date },
    },
    _id: false,
    select: false,
  })
  currentSession?: {
    accessToken?: string;
    refreshToken?: string;
    expiresAt?: Date;
  };
}

export const UserSchema = SchemaFactory.createForClass(User);
UserSchema.index({ 'profile.lastName': 1 });
UserSchema.index({ email: 1, isActive: 1 });
