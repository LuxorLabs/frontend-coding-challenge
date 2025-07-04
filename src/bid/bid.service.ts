import {
  Injectable,
  NotFoundException,
  ForbiddenException,
  BadRequestException,
} from '@nestjs/common';
import {PrismaService} from '../prisma/prisma.service';
import {CreateBidDto} from './dto/create-bid.dto';
import {UpdateBidDto} from './dto/update-bid.dto';

@Injectable()
export class BidService {
  constructor(private readonly prisma: PrismaService) {}

  async findByCollection(collectionId: string) {
    const collection = await this.prisma.collection.findUnique({
      where: {id: collectionId},
    });

    if (!collection) {
      throw new NotFoundException('Collection not found');
    }

    return this.prisma.bid.findMany({
      where: {collectionId},
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
        collection: {
          select: {
            id: true,
            name: true,
            price: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });
  }

  async findOne(id: string) {
    const bid = await this.prisma.bid.findUnique({
      where: {id},
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
        collection: {
          select: {
            id: true,
            name: true,
            price: true,
          },
        },
      },
    });

    if (!bid) {
      throw new NotFoundException('Bid not found');
    }

    return bid;
  }

  async create(userId: string, dto: CreateBidDto) {
    const collection = await this.prisma.collection.findUnique({
      where: {id: dto.collectionId},
    });

    if (!collection) {
      throw new NotFoundException('Collection not found');
    }

    if (collection.userId === userId) {
      throw new BadRequestException('You cannot bid on your own collection');
    }

    const existingBid = await this.prisma.bid.findFirst({
      where: {
        collectionId: dto.collectionId,
        userId,
        status: 'PENDING',
      },
    });

    if (existingBid) {
      throw new BadRequestException(
        'You already have a pending bid on this collection',
      );
    }

    return this.prisma.bid.create({
      data: {
        collectionId: dto.collectionId,
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
        collection: {
          select: {
            id: true,
            name: true,
            price: true,
          },
        },
      },
    });
  }

  async update(id: string, userId: string, dto: UpdateBidDto) {
    const bid = await this.prisma.bid.findUnique({
      where: {id},
    });

    if (!bid) {
      throw new NotFoundException('Bid not found');
    }

    if (bid.userId !== userId) {
      throw new ForbiddenException('You can only update your own bids');
    }

    if (bid.status !== 'PENDING') {
      throw new BadRequestException('You can only update pending bids');
    }

    return this.prisma.bid.update({
      where: {id},
      data: {
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
        collection: {
          select: {
            id: true,
            name: true,
            price: true,
          },
        },
      },
    });
  }

  async remove(id: string, userId: string) {
    const bid = await this.prisma.bid.findUnique({
      where: {id},
    });

    if (!bid) {
      throw new NotFoundException('Bid not found');
    }

    if (bid.userId !== userId) {
      throw new ForbiddenException('You can only delete your own bids');
    }

    if (bid.status !== 'PENDING') {
      throw new BadRequestException('You can only delete pending bids');
    }

    await this.prisma.bid.delete({
      where: {id},
    });

    return {
      message: 'Bid deleted successfully',
    };
  }

  async acceptBid(collectionId: string, bidId: string, userId: string) {
    const collection = await this.prisma.collection.findUnique({
      where: {id: collectionId},
    });

    if (!collection) {
      throw new NotFoundException('Collection not found');
    }

    if (collection.userId !== userId) {
      throw new ForbiddenException(
        'You can only accept bids on your own collections',
      );
    }

    const bid = await this.prisma.bid.findUnique({
      where: {id: bidId},
    });

    if (!bid) {
      throw new NotFoundException('Bid not found');
    }

    if (bid.collectionId !== collectionId) {
      throw new BadRequestException('Bid does not belong to this collection');
    }

    if (bid.status !== 'PENDING') {
      throw new BadRequestException('Bid is not pending');
    }

    return this.prisma.$transaction(async (tx) => {
      await tx.bid.updateMany({
        where: {
          collectionId,
          status: 'PENDING',
          id: {not: bidId},
        },
        data: {
          status: 'REJECTED',
        },
      });

      const acceptedBid = await tx.bid.update({
        where: {id: bidId},
        data: {
          status: 'ACCEPTED',
        },
        include: {
          user: {
            select: {
              id: true,
              name: true,
              email: true,
            },
          },
          collection: {
            select: {
              id: true,
              name: true,
              price: true,
            },
          },
        },
      });

      return {
        acceptedBid,
        message:
          'Bid accepted successfully. Other pending bids have been rejected.',
      };
    });
  }

  async rejectBid(collectionId: string, bidId: string, userId: string) {
    const collection = await this.prisma.collection.findUnique({
      where: {id: collectionId},
    });

    if (!collection) {
      throw new NotFoundException('Collection not found');
    }

    if (collection.userId !== userId) {
      throw new ForbiddenException(
        'You can only reject bids on your own collections',
      );
    }

    const bid = await this.prisma.bid.findUnique({
      where: {id: bidId},
    });

    if (!bid) {
      throw new NotFoundException('Bid not found');
    }

    if (bid.collectionId !== collectionId) {
      throw new BadRequestException('Bid does not belong to this collection');
    }

    if (bid.status !== 'PENDING') {
      throw new BadRequestException('Bid is not pending');
    }

    const rejectedBid = await this.prisma.bid.update({
      where: {id: bidId},
      data: {
        status: 'REJECTED',
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
        collection: {
          select: {
            id: true,
            name: true,
            price: true,
          },
        },
      },
    });

    return {
      rejectedBid,
      message: 'Bid rejected successfully.',
    };
  }
}
