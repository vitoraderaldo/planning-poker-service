import { PipeTransform, Injectable, NotFoundException } from '@nestjs/common';
import { isValidObjectId } from 'mongoose';

@Injectable()
export class MongoId implements PipeTransform {
  transform(value: string) {
    if (!isValidObjectId(value)) {
      throw new NotFoundException('Invalid id')
    }
    return value;
  }
}
