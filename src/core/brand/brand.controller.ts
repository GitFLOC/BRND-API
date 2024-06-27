// Dependencies
import {
  Body,
  Controller,
  Get,
  Param,
  Post,
  Query,
  Res,
  UseGuards,
} from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { Response } from 'express';

// Services
import { BrandService } from './services';

// Models
import { Brand, CurrentUser } from '../../models';

// Utils
import { HttpStatus, hasError, hasResponse } from '../../utils';

// Utils
import { AuthorizationGuard } from '../../security/guards';
import { Session } from '../../security/decorators';

@ApiTags('brand-service')
@Controller('brand-service')
export class BrandController {
  constructor(private readonly brandService: BrandService) {}

  /**
   * Retrieves a brand by its ID.
   *
   * @param {Brand['id']} id - The ID of the brand to retrieve.
   * @returns {Promise<Brand | undefined>} The brand entity or undefined if not found.
   */
  @Get('/brand/:id')
  @UseGuards(AuthorizationGuard)
  getBrandById(@Param('id') id: Brand['id']): Promise<Brand | undefined> {
    return this.brandService.getById(id);
  }

  /**
   * Retrieves all brands with pagination.
   *
   * @param {string} search - The search query to filter brands.
   * @param {number} pageId - The ID of the page to retrieve.
   * @param {number} limit - The number of brands to retrieve per page.
   * @param {Response} res - The response object.
   * @returns {Promise<Response>} A response object containing the page ID, total count of brands, and an array of brand objects.
   */
  @Get('/all')
  @UseGuards(AuthorizationGuard)
  async getAllBrands(
    @Query('search') search: string,
    @Query('pageId') pageId: number,
    @Query('limit') limit: number,
    @Res() res: Response,
  ) {
    const [brands, count] = await this.brandService.getAll(
      ['id', 'name', 'url', 'imageUrl'],
      [],
      search,
      pageId,
      limit,
    );

    return hasResponse(res, {
      pageId,
      count,
      brands,
    });
  }

  /**
   * Records votes for multiple brands.
   *
   * @param {CurrentUser} user - The current user session.
   * @param {{ ids: string[] }} ids - An object containing an array of brand IDs to vote for.
   * @param {Response} res - The response object.
   * @returns {Promise<Response>} A response object indicating the result of the vote operation.
   */
  @Post('/vote')
  @UseGuards(AuthorizationGuard)
  async voteBrands(
    @Session() user: CurrentUser,
    @Body() { ids }: { ids: string[] },
    @Res() res: Response,
  ): Promise<Response> {
    try {
      const votes = await this.brandService.voteForBrands(user.id, ids);
      return hasResponse(
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
    } catch (error) {
      return hasError(
        res,
        HttpStatus.INTERNAL_SERVER_ERROR,
        'voteBrands',
        error.toString(),
      );
    }
  }
}
