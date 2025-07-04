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
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiParam,
  ApiBody,
  ApiHeader,
  ApiBearerAuth,
} from '@nestjs/swagger';
import {CollectionService} from './collection.service';
import {CreateCollectionDto} from './dto/create-collection.dto';
import {UpdateCollectionDto} from './dto/update-collection.dto';
import {JwtAuthGuard} from '../auth/guards/jwt-auth.guard';

@ApiTags('Collections')
@ApiBearerAuth()
@Controller('collections')
@UseGuards(JwtAuthGuard)
export class CollectionController {
  constructor(private readonly collectionService: CollectionService) {}

  @Get()
  @ApiOperation({summary: 'Get all collections with bids'})
  @ApiResponse({
    status: 200,
    description: 'Returns an array of all collections with their bids',
    schema: {
      example: [
        {
          id: '123',
          name: 'Digital Art Collection',
          description: 'Rare digital artwork',
          stocks: 10,
          price: 1299.99,
          user: {
            id: '456',
            name: 'John Doe',
            email: 'john@example.com',
          },
          bids: [
            {
              id: '789',
              price: 1400.0,
              status: 'PENDING',
              user: {
                id: '101',
                name: 'Jane Smith',
                email: 'jane@example.com',
              },
            },
          ],
        },
      ],
    },
  })
  findAll() {
    return this.collectionService.findAll();
  }

  @Get(':id')
  @ApiOperation({summary: 'Get one collection by ID with bids'})
  @ApiParam({
    name: 'id',
    description: 'The unique identifier of the collection',
    example: '123',
  })
  @ApiResponse({
    status: 200,
    description: 'Returns the collection with the given ID and its bids',
  })
  @ApiResponse({
    status: 404,
    description: 'Collection not found',
  })
  findOne(@Param('id') id: string) {
    return this.collectionService.findOne(id);
  }

  @Post()
  @ApiOperation({summary: 'Create a new collection'})
  @ApiBody({
    description: 'The collection data to create',
    type: CreateCollectionDto,
  })
  @ApiResponse({
    status: 201,
    description: 'Collection created successfully',
  })
  create(@Body() createDto: CreateCollectionDto, @Req() req) {
    return this.collectionService.create(req.user.id, createDto);
  }

  @Patch(':id')
  @ApiOperation({summary: 'Update an existing collection'})
  @ApiParam({
    name: 'id',
    description: 'The ID of the collection to update',
    example: '123',
  })
  @ApiBody({
    description: 'Fields to update',
    type: UpdateCollectionDto,
  })
  @ApiResponse({
    status: 200,
    description: 'Returns the updated collection',
  })
  @ApiResponse({
    status: 404,
    description: 'Collection not found',
  })
  @ApiResponse({
    status: 403,
    description: 'You can only update your own collections',
  })
  update(
    @Param('id') id: string,
    @Body() updateDto: UpdateCollectionDto,
    @Req() req,
  ) {
    return this.collectionService.update(id, req.user.id, updateDto);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({summary: 'Delete a collection by ID'})
  @ApiParam({
    name: 'id',
    description: 'The ID of the collection to delete',
    example: '123',
  })
  @ApiResponse({
    status: 204,
    description: 'Collection deleted successfully',
  })
  @ApiResponse({
    status: 404,
    description: 'Collection not found',
  })
  @ApiResponse({
    status: 403,
    description: 'You can only delete your own collections',
  })
  remove(@Param('id') id: string, @Req() req) {
    return this.collectionService.remove(id, req.user.id);
  }
}
