// Dependencies
import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Res,
  UseGuards,
} from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { Response } from 'express';

// Services
import { UserService } from './services';

// Security
import { AdminGuard, AuthorizationGuard } from '../../security/guards';
import { Session } from '../../security/decorators';

// Models
import { User } from '../../models';

// Utils
import { hasResponse } from '../../utils';

@ApiTags('user-service')
@Controller('user-service')
export class UserController {
  constructor(private readonly userService: UserService) {}

  /**
   * Retrieves a user by their ID.
   *
   * @param {User['id']} id - The ID of the user to retrieve.
   * @returns {Promise<User>} The user with the specified ID.
   */
  @Get('/user/:id')
  getUserById(@Param('id') id: User['id']) {
    return this.userService.getById(id, ['id', 'username', 'createdAt']);
  }

  /**
   * Updates a user by their ID.
   *
   * @param {User['id']} id - The ID of the user to update.
   * @param {Partial<User>} data - The data to update the user with.
   * @returns {Promise<User>} The updated user.
   */
  @Patch('/user/:id')
  @UseGuards(AdminGuard)
  updateUser(@Param('id') id: User['id'], @Body('body') data: Partial<User>) {
    return this.userService.update(id, data);
  }

  /**
   * Deletes a user by their ID.
   *
   * @param {User['id']} id - The ID of the user to delete.
   * @returns {Promise<boolean>} Returns true if the user was successfully deleted.
   * @throws {Error} If the user with the specified ID is not found.
   */
  @Delete('/user/:id')
  @UseGuards(AdminGuard)
  deleteUser(@Param('id') id: User['id']) {
    return this.userService.delete(id);
  }

  /**
   * Retrieves the votes of a user for a specific date.
   *
   * @param session - The current user session.
   * @param unixDate - The date in Unix timestamp format.
   * @param res - The response object.
   * @returns A list of votes with details including id, date, position, and brand information.
   */
  @Get('/votes/:unixDate')
  @UseGuards(AuthorizationGuard)
  async getVotes(
    @Session() session: User,
    @Param('unixDate') unixDate: string,
    @Res() res: Response,
  ) {
    const votes = await this.userService.getUserVotes(
      session.id,
      Number(unixDate),
    );
    hasResponse(
      res,
      votes.map((vote) => ({
        id: vote.id,
        date: vote.date,
        position: vote.position,
        brand: {
          id: vote.brand.id,
          name: vote.brand.name,
          imageUrl: vote.brand.imageUrl,
        },
      })),
    );
  }
}
