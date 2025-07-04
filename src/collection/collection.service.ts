import {
  Injectable,
  NotFoundException,
  ForbiddenException,
} from '@nestjs/common';
import {PrismaService} from '../prisma/prisma.service';
import {CreateCollectionDto} from './dto/create-collection.dto';
import {UpdateCollectionDto} from './dto/update-collection.dto';

@Injectable()
export class CollectionService {
  constructor(private readonly prisma: PrismaService) {}

  async findAll() {
    return this.prisma.collection.findMany({
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
        bids: {
          include: {
            user: {
              select: {
                id: true,
                name: true,
                email: true,
              },
            },
          },
          orderBy: {
            createdAt: 'desc',
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });
  }

  async findOne(id: string) {
    const collection = await this.prisma.collection.findUnique({
      where: {id},
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
        bids: {
          include: {
            user: {
              select: {
                id: true,
                name: true,
                email: true,
              },
            },
          },
          orderBy: {
            createdAt: 'desc',
          },
        },
      },
    });

    if (!collection) {
      throw new NotFoundException('Collection not found');
    }

    return collection;
  }

  async create(userId: string, dto: CreateCollectionDto) {
    return this.prisma.collection.create({
      data: {
        name: dto.name,
        description: dto.description,
        stocks: dto.stocks,
        price: dto.price,
        userId,
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
        bids: true,
      },
    });
  }

  async update(id: string, userId: string, dto: UpdateCollectionDto) {
    const collection = await this.prisma.collection.findUnique({
      where: {id},
    });

    if (!collection) {
      throw new NotFoundException('Collection not found');
    }

    if (collection.userId !== userId) {
      throw new ForbiddenException('You can only update your own collections');
    }

    return this.prisma.collection.update({
      where: {id},
      data: {
        name: dto.name,
        description: dto.description,
        stocks: dto.stocks,
        price: dto.price,
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
        bids: {
          include: {
            user: {
              select: {
                id: true,
                name: true,
                email: true,
              },
            },
          },
        },
      },
    });
  }

  async remove(id: string, userId: string) {
    const collection = await this.prisma.collection.findUnique({
      where: {id},
      include: {bids: true},
    });

    if (!collection) {
      throw new NotFoundException('Collection not found');
    }

    if (collection.userId !== userId) {
      throw new ForbiddenException('You can only delete your own collections');
    }

    return this.prisma.$transaction(async (tx) => {
      await tx.bid.deleteMany({
        where: {collectionId: id},
      });

      await tx.collection.delete({
        where: {id},
      });

      return {
        message: 'Collection deleted successfully',
        deletedBids: collection.bids.length,
      };
    });
  }
}
