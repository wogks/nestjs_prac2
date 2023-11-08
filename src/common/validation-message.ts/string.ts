import { ValidationArguments } from 'class-validator';

export const stringValidationMessage = (args: ValidationArguments) => {
  return `${args.property}에 스트링을 입력해주세요`;
};
