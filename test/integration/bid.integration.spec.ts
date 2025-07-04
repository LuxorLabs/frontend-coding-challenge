import {INestApplication} from '@nestjs/common';
import {Test, TestingModule} from '@nestjs/testing';
import {ValidationPipe} from '@nestjs/common';
import * as request from 'supertest';
import {AppModule} from '../../src/app.module';
import {PrismaService} from '../../src/prisma/prisma.service';

describe('BidController (Integration)', () => {
  let app: INestApplication;
  let prisma: PrismaService;
  let ownerToken: string;
  let bidderToken: string;
  let secondBidderToken: string;
  let ownerId: string;
  let bidderId: string;
  let secondBidderId: string;
  let collectionId: string;

  beforeAll(async () => {
    const moduleRef: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleRef.createNestApplication();
    app.useGlobalPipes(
      new ValidationPipe({
        whitelist: true,
        forbidNonWhitelisted: true,
        transform: true,
      }),
    );

    prisma = moduleRef.get<PrismaService>(PrismaService);
    await app.init();
  });

  beforeEach(async () => {
    await prisma.bid.deleteMany();
    await prisma.collection.deleteMany();
    await prisma.user.deleteMany();

    // Create owner user
    const ownerResponse = await request(app.getHttpServer())
      .post('/auth/register')
      .send({
        email: 'owner@example.com',
        password: 'password123',
        name: 'Collection Owner',
      });

    ownerToken = ownerResponse.body.access_token;
    ownerId = ownerResponse.body.user.id;

    // Create bidder user
    const bidderResponse = await request(app.getHttpServer())
      .post('/auth/register')
      .send({
        email: 'bidder@example.com',
        password: 'password123',
        name: 'Bidder User',
      });

    bidderToken = bidderResponse.body.access_token;
    bidderId = bidderResponse.body.user.id;

    // Create second bidder user
    const secondBidderResponse = await request(app.getHttpServer())
      .post('/auth/register')
      .send({
        email: 'bidder2@example.com',
        password: 'password123',
        name: 'Second Bidder',
      });

    secondBidderToken = secondBidderResponse.body.access_token;
    secondBidderId = secondBidderResponse.body.user.id;

    // Create collection
    const collectionResponse = await request(app.getHttpServer())
      .post('/collections')
      .set('Authorization', `Bearer ${ownerToken}`)
      .send({
        name: 'Test Collection',
        description: 'Test Description',
        stocks: 5,
        price: 1000.0,
      });

    collectionId = collectionResponse.body.id;
  });

  afterAll(async () => {
    await prisma.bid.deleteMany();
    await prisma.collection.deleteMany();
    await prisma.user.deleteMany();
    await app.close();
  });

  describe('POST /bids', () => {
    it('should create a bid successfully', async () => {
      const createDto = {
        collectionId,
        price: 1200.0,
      };

      const response = await request(app.getHttpServer())
        .post('/bids')
        .set('Authorization', `Bearer ${bidderToken}`)
        .send(createDto)
        .expect(201);

      expect(response.body).toMatchObject({
        collectionId,
        price: 1200.0,
        status: 'PENDING',
        user: {
          id: bidderId,
          name: 'Bidder User',
          email: 'bidder@example.com',
        },
      });
    });

    it('should return 400 when bidding on own collection', async () => {
      const createDto = {
        collectionId,
        price: 1200.0,
      };

      await request(app.getHttpServer())
        .post('/bids')
        .set('Authorization', `Bearer ${ownerToken}`)
        .send(createDto)
        .expect(400);
    });

    it('should return 400 when user already has pending bid', async () => {
      const createDto = {
        collectionId,
        price: 1200.0,
      };

      // Create first bid
      await request(app.getHttpServer())
        .post('/bids')
        .set('Authorization', `Bearer ${bidderToken}`)
        .send(createDto)
        .expect(201);

      // Try to create second bid from same user
      await request(app.getHttpServer())
        .post('/bids')
        .set('Authorization', `Bearer ${bidderToken}`)
        .send({...createDto, price: 1300.0})
        .expect(400);
    });

    it('should return 404 for non-existent collection', async () => {
      const createDto = {
        collectionId: 'non-existent-id',
        price: 1200.0,
      };

      await request(app.getHttpServer())
        .post('/bids')
        .set('Authorization', `Bearer ${bidderToken}`)
        .send(createDto)
        .expect(404);
    });

    it('should return 401 without authentication', async () => {
      const createDto = {
        collectionId,
        price: 1200.0,
      };

      await request(app.getHttpServer())
        .post('/bids')
        .send(createDto)
        .expect(401);
    });
  });

  describe('GET /bids', () => {
    beforeEach(async () => {
      // Create bids
      await request(app.getHttpServer())
        .post('/bids')
        .set('Authorization', `Bearer ${bidderToken}`)
        .send({
          collectionId,
          price: 1200.0,
        });

      await request(app.getHttpServer())
        .post('/bids')
        .set('Authorization', `Bearer ${secondBidderToken}`)
        .send({
          collectionId,
          price: 1300.0,
        });
    });

    it('should return bids for collection', async () => {
      const response = await request(app.getHttpServer())
        .get(`/bids?collectionId=${collectionId}`)
        .set('Authorization', `Bearer ${ownerToken}`)
        .expect(200);

      expect(response.body).toHaveLength(2);
      expect(response.body[0]).toMatchObject({
        collectionId,
        status: 'PENDING',
        user: expect.objectContaining({
          name: expect.any(String),
          email: expect.any(String),
        }),
      });
    });

    it('should return 404 for non-existent collection', async () => {
      await request(app.getHttpServer())
        .get('/bids?collectionId=non-existent-id')
        .set('Authorization', `Bearer ${ownerToken}`)
        .expect(404);
    });

    it('should return 401 without authentication', async () => {
      await request(app.getHttpServer())
        .get(`/bids?collectionId=${collectionId}`)
        .expect(401);
    });
  });

  describe('GET /bids/:id', () => {
    let bidId: string;

    beforeEach(async () => {
      const response = await request(app.getHttpServer())
        .post('/bids')
        .set('Authorization', `Bearer ${bidderToken}`)
        .send({
          collectionId,
          price: 1200.0,
        });

      bidId = response.body.id;
    });

    it('should return bid by ID', async () => {
      const response = await request(app.getHttpServer())
        .get(`/bids/${bidId}`)
        .set('Authorization', `Bearer ${bidderToken}`)
        .expect(200);

      expect(response.body).toMatchObject({
        id: bidId,
        collectionId,
        price: 1200.0,
        status: 'PENDING',
      });
    });

    it('should return 404 for non-existent bid', async () => {
      await request(app.getHttpServer())
        .get('/bids/non-existent-id')
        .set('Authorization', `Bearer ${bidderToken}`)
        .expect(404);
    });
  });

  describe('PATCH /bids/:id', () => {
    let bidId: string;

    beforeEach(async () => {
      const response = await request(app.getHttpServer())
        .post('/bids')
        .set('Authorization', `Bearer ${bidderToken}`)
        .send({
          collectionId,
          price: 1200.0,
        });

      bidId = response.body.id;
    });

    it('should update bid by owner', async () => {
      const updateDto = {
        price: 1400.0,
      };

      const response = await request(app.getHttpServer())
        .patch(`/bids/${bidId}`)
        .set('Authorization', `Bearer ${bidderToken}`)
        .send(updateDto)
        .expect(200);

      expect(response.body).toMatchObject({
        id: bidId,
        price: 1400.0,
      });
    });

    it('should return 403 when non-owner tries to update', async () => {
      const updateDto = {
        price: 1400.0,
      };

      await request(app.getHttpServer())
        .patch(`/bids/${bidId}`)
        .set('Authorization', `Bearer ${secondBidderToken}`)
        .send(updateDto)
        .expect(403);
    });

    it('should return 404 for non-existent bid', async () => {
      await request(app.getHttpServer())
        .patch('/bids/non-existent-id')
        .set('Authorization', `Bearer ${bidderToken}`)
        .send({price: 1400.0})
        .expect(404);
    });
  });

  describe('DELETE /bids/:id', () => {
    let bidId: string;

    beforeEach(async () => {
      const response = await request(app.getHttpServer())
        .post('/bids')
        .set('Authorization', `Bearer ${bidderToken}`)
        .send({
          collectionId,
          price: 1200.0,
        });

      bidId = response.body.id;
    });

    it('should delete bid by owner', async () => {
      await request(app.getHttpServer())
        .delete(`/bids/${bidId}`)
        .set('Authorization', `Bearer ${bidderToken}`)
        .expect(204);

      await request(app.getHttpServer())
        .get(`/bids/${bidId}`)
        .set('Authorization', `Bearer ${bidderToken}`)
        .expect(404);
    });

    it('should return 403 when non-owner tries to delete', async () => {
      await request(app.getHttpServer())
        .delete(`/bids/${bidId}`)
        .set('Authorization', `Bearer ${secondBidderToken}`)
        .expect(403);
    });

    it('should return 404 for non-existent bid', async () => {
      await request(app.getHttpServer())
        .delete('/bids/non-existent-id')
        .set('Authorization', `Bearer ${bidderToken}`)
        .expect(404);
    });
  });

  describe('POST /bids/accept/:collectionId/:bidId', () => {
    let bidId: string;
    let secondBidId: string;

    beforeEach(async () => {
      // Create first bid
      const response1 = await request(app.getHttpServer())
        .post('/bids')
        .set('Authorization', `Bearer ${bidderToken}`)
        .send({
          collectionId,
          price: 1200.0,
        });

      bidId = response1.body.id;

      // Create second bid
      const response2 = await request(app.getHttpServer())
        .post('/bids')
        .set('Authorization', `Bearer ${secondBidderToken}`)
        .send({
          collectionId,
          price: 1300.0,
        });

      secondBidId = response2.body.id;
    });

    it('should accept bid and reject others', async () => {
      const response = await request(app.getHttpServer())
        .post(`/bids/accept/${collectionId}/${bidId}`)
        .set('Authorization', `Bearer ${ownerToken}`)
        .expect(200);

      expect(response.body).toMatchObject({
        acceptedBid: {
          id: bidId,
          status: 'ACCEPTED',
        },
        message: expect.stringContaining('accepted successfully'),
      });

      // Verify other bid was rejected
      const bidsResponse = await request(app.getHttpServer())
        .get(`/bids?collectionId=${collectionId}`)
        .set('Authorization', `Bearer ${ownerToken}`)
        .expect(200);

      const rejectedBid = bidsResponse.body.find(
        (bid) => bid.id === secondBidId,
      );
      expect(rejectedBid.status).toBe('REJECTED');
    });

    it('should return 403 when non-owner tries to accept', async () => {
      await request(app.getHttpServer())
        .post(`/bids/accept/${collectionId}/${bidId}`)
        .set('Authorization', `Bearer ${bidderToken}`)
        .expect(403);
    });

    it('should return 404 for non-existent collection', async () => {
      await request(app.getHttpServer())
        .post(`/bids/accept/non-existent-id/${bidId}`)
        .set('Authorization', `Bearer ${ownerToken}`)
        .expect(404);
    });

    it('should return 404 for non-existent bid', async () => {
      await request(app.getHttpServer())
        .post(`/bids/accept/${collectionId}/non-existent-id`)
        .set('Authorization', `Bearer ${ownerToken}`)
        .expect(404);
    });

    it('should return 401 without authentication', async () => {
      await request(app.getHttpServer())
        .post(`/bids/accept/${collectionId}/${bidId}`)
        .expect(401);
    });
  });
});
