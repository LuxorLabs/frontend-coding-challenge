import {
  Controller,
  Get,
  Post,
  Param,
  Body,
  Patch,
  Delete,
  HttpCode,
  HttpStatus,
  UseGuards,
  Req,
  Query,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiParam,
  ApiBody,
  ApiQuery,
  ApiBearerAuth,
} from '@nestjs/swagger';
import {BidService} from './bid.service';
import {CreateBidDto} from './dto/create-bid.dto';
import {UpdateBidDto} from './dto/update-bid.dto';
import {JwtAuthGuard} from '../auth/guards/jwt-auth.guard';

@ApiTags('Bids')
@ApiBearerAuth()
@Controller('bids')
@UseGuards(JwtAuthGuard)
export class BidController {
  constructor(private readonly bidService: BidService) {}

  @Get()
  @ApiOperation({summary: 'Get bids by collection ID'})
  @ApiQuery({
    name: 'collectionId',
    description: 'The collection ID to get bids for',
    required: true,
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @ApiResponse({
    status: 200,
    description: 'Returns an array of bids for the specified collection',
    schema: {
      example: [
        {
          id: '789',
          price: 1500.0,
          status: 'PENDING',
          collectionId: '123',
          userId: '456',
          user: {
            id: '456',
            name: 'Jane Smith',
            email: 'jane@example.com',
          },
          collection: {
            id: '123',
            name: 'Digital Art Collection',
            price: 1299.99,
          },
        },
      ],
    },
  })
  findByCollection(@Query('collectionId') collectionId: string) {
    return this.bidService.findByCollection(collectionId);
  }

  @Get(':id')
  @ApiOperation({summary: 'Get one bid by ID'})
  @ApiParam({
    name: 'id',
    description: 'The unique identifier of the bid',
    example: '789',
  })
  @ApiResponse({
    status: 200,
    description: 'Returns the bid with the given ID',
  })
  @ApiResponse({
    status: 404,
    description: 'Bid not found',
  })
  findOne(@Param('id') id: string) {
    return this.bidService.findOne(id);
  }

  @Post()
  @ApiOperation({summary: 'Create a new bid'})
  @ApiBody({
    description: 'The bid data to create',
    type: CreateBidDto,
  })
  @ApiResponse({
    status: 200,
    description: 'Bid created successfully',
  })
  @ApiResponse({
    status: 400,
    description:
      'Bad request - cannot bid on own collection or already have pending bid',
  })
  create(@Body() createDto: CreateBidDto, @Req() req) {
    return this.bidService.create(req.user.id, createDto);
  }

  @Patch(':id')
  @ApiOperation({summary: 'Update an existing bid'})
  @ApiParam({
    name: 'id',
    description: 'The ID of the bid to update',
    example: '789',
  })
  @ApiBody({
    description: 'Fields to update',
    type: UpdateBidDto,
  })
  @ApiResponse({
    status: 200,
    description: 'Returns the updated bid',
  })
  @ApiResponse({
    status: 404,
    description: 'Bid not found',
  })
  @ApiResponse({
    status: 403,
    description: 'You can only update your own bids',
  })
  @ApiResponse({
    status: 400,
    description: 'You can only update pending bids',
  })
  update(@Param('id') id: string, @Body() updateDto: UpdateBidDto, @Req() req) {
    return this.bidService.update(id, req.user.id, updateDto);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({summary: 'Delete a bid by ID'})
  @ApiParam({
    name: 'id',
    description: 'The ID of the bid to delete',
    example: '789',
  })
  @ApiResponse({
    status: 204,
    description: 'Bid deleted successfully',
  })
  @ApiResponse({
    status: 404,
    description: 'Bid not found',
  })
  @ApiResponse({
    status: 403,
    description: 'You can only delete your own bids',
  })
  @ApiResponse({
    status: 400,
    description: 'You can only delete pending bids',
  })
  remove(@Param('id') id: string, @Req() req) {
    return this.bidService.remove(id, req.user.id);
  }

  @Post('accept/:collectionId/:bidId')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({summary: 'Accept a bid (rejects other pending bids)'})
  @ApiParam({
    name: 'collectionId',
    description: 'The ID of the collection',
    example: '123',
  })
  @ApiParam({
    name: 'bidId',
    description: 'The ID of the bid to accept',
    example: '789',
  })
  @ApiResponse({
    status: 200,
    description: 'Bid accepted successfully, other pending bids rejected',
  })
  @ApiResponse({
    status: 404,
    description: 'Collection or bid not found',
  })
  @ApiResponse({
    status: 403,
    description: 'You can only accept bids on your own collections',
  })
  @ApiResponse({
    status: 400,
    description: 'Bid is not pending or does not belong to collection',
  })
  acceptBid(
    @Param('collectionId') collectionId: string,
    @Param('bidId') bidId: string,
    @Req() req,
  ) {
    return this.bidService.acceptBid(collectionId, bidId, req.user.id);
  }

  @Post('reject/:collectionId/:bidId')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({summary: 'Reject a specific bid'})
  @ApiParam({
    name: 'collectionId',
    description: 'The ID of the collection',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @ApiParam({
    name: 'bidId',
    description: 'The ID of the bid to reject',
    example: '789e4567-e89b-12d3-a456-426614174001',
  })
  @ApiResponse({
    status: 200,
    description: 'Bid rejected successfully',
    schema: {
      example: {
        rejectedBid: {
          id: '789e4567-e89b-12d3-a456-426614174001',
          price: 1500.0,
          status: 'REJECTED',
          collectionId: '123e4567-e89b-12d3-a456-426614174000',
          userId: '456e4567-e89b-12d3-a456-426614174002',
          user: {
            id: '456e4567-e89b-12d3-a456-426614174002',
            name: 'Jane Smith',
            email: 'jane@example.com',
          },
          collection: {
            id: '123e4567-e89b-12d3-a456-426614174000',
            name: 'Digital Art Collection',
            price: 1299.99,
          },
        },
        message: 'Bid rejected successfully.',
      },
    },
  })
  @ApiResponse({
    status: 404,
    description: 'Collection or bid not found',
  })
  @ApiResponse({
    status: 403,
    description: 'You can only reject bids on your own collections',
  })
  @ApiResponse({
    status: 400,
    description: 'Bid is not pending or does not belong to collection',
  })
  rejectBid(
    @Param('collectionId') collectionId: string,
    @Param('bidId') bidId: string,
    @Req() req,
  ) {
    return this.bidService.rejectBid(collectionId, bidId, req.user.id);
  }
}
