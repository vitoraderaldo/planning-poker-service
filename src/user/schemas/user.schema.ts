import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

@Schema()
export class User {    
    @Prop()
    name: string    
}

export const UserSchema = SchemaFactory.createForClass(User)
export type UserDocument = User & Document;
