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
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiParam,
  ApiBody,
} from '@nestjs/swagger';
import {UserService} from './user.service';
import {CreateUserDto} from './dto/create-user.dto';
import {UpdateUserDto} from './dto/update-user.dto';

@ApiTags('Users')
@Controller('users')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Get()
  @ApiOperation({summary: 'Get all users'})
  @ApiResponse({
    status: 200,
    description: 'Returns an array of all users',
    schema: {
      example: [
        {
          id: '123',
          email: 'john@example.com',
          name: 'John Doe',
          role: 'USER',
          createdAt: '2024-01-01T00:00:00.000Z',
          updatedAt: '2024-01-01T00:00:00.000Z',
        },
      ],
    },
  })
  findAll() {
    return this.userService.findAll();
  }

  @Get(':id')
  @ApiOperation({summary: 'Get one user by ID'})
  @ApiParam({
    name: 'id',
    description: 'The unique identifier of the user',
    example: '123',
  })
  @ApiResponse({
    status: 200,
    description: 'Returns the user with the given ID',
  })
  @ApiResponse({
    status: 404,
    description: 'User not found',
  })
  findOne(@Param('id') id: string) {
    return this.userService.findOne(id);
  }

  @Post()
  @ApiOperation({summary: 'Create a new user'})
  @ApiBody({
    description: 'The user data to create',
    type: CreateUserDto,
  })
  @ApiResponse({
    status: 201,
    description: 'User created successfully',
  })
  @ApiResponse({
    status: 409,
    description: 'User with this email already exists',
  })
  create(@Body() createDto: CreateUserDto) {
    return this.userService.create(createDto);
  }

  @Patch(':id')
  @ApiOperation({summary: 'Update an existing user'})
  @ApiParam({
    name: 'id',
    description: 'The ID of the user to update',
    example: '123',
  })
  @ApiBody({
    description: 'Fields to update',
    type: UpdateUserDto,
  })
  @ApiResponse({
    status: 200,
    description: 'Returns the updated user',
  })
  @ApiResponse({
    status: 404,
    description: 'User not found',
  })
  @ApiResponse({
    status: 409,
    description: 'User with this email already exists',
  })
  update(@Param('id') id: string, @Body() updateDto: UpdateUserDto) {
    return this.userService.update(id, updateDto);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({summary: 'Delete a user by ID'})
  @ApiParam({
    name: 'id',
    description: 'The ID of the user to delete',
    example: '123',
  })
  @ApiResponse({
    status: 204,
    description: 'User deleted successfully',
  })
  @ApiResponse({
    status: 404,
    description: 'User not found',
  })
  remove(@Param('id') id: string) {
    return this.userService.remove(id);
  }
}
