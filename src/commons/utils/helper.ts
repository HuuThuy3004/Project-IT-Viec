import { HttpException, HttpStatus } from '@nestjs/common';

export const convertStringSortToObject = (sort: string) => {
  try {
    const sortArray = sort.split(',');
    return Object.fromEntries(
      sortArray.map((e) => [e.split(':')[0], e.split(':')[1]]),
    );
  } catch (error) {
    throw new HttpException(error.message, HttpStatus.BAD_REQUEST)
  }
};

export const convertKeySortManuscript = (sortObj) => {
  try {
    const sortConverted = {}
    for (const key of Object.keys(sortObj)) {
      if (key === 'salary') {
        sortConverted['manuscript.maxSalary'] = sortObj[key];
      }
      if (key === 'title') {
        sortConverted['manuscript.title'] = sortObj[key];
      }
    }
    return sortConverted;
  } catch (error) {
    throw new HttpException(error.message, HttpStatus.BAD_REQUEST)
  }
}