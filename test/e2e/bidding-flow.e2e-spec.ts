import {INestApplication} from '@nestjs/common';
import {Test, TestingModule} from '@nestjs/testing';
import {ValidationPipe} from '@nestjs/common';
import * as request from 'supertest';
import {AppModule} from '../../src/app.module';
import {PrismaService} from '../../src/prisma/prisma.service';

describe('Bidding Flow (E2E)', () => {
  let app: INestApplication;
  let prisma: PrismaService;

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
  });

  afterAll(async () => {
    await prisma.bid.deleteMany();
    await prisma.collection.deleteMany();
    await prisma.user.deleteMany();
    await app.close();
  });

  describe('Complete Bidding Flow', () => {
    it('should handle complete bidding workflow', async () => {
      // Step 1: Register users
      const ownerResponse = await request(app.getHttpServer())
        .post('/auth/register')
        .send({
          email: 'owner@example.com',
          password: 'password123',
          name: 'Collection Owner',
        })
        .expect(201);

      const bidder1Response = await request(app.getHttpServer())
        .post('/auth/register')
        .send({
          email: 'bidder1@example.com',
          password: 'password123',
          name: 'Bidder 1',
        })
        .expect(201);

      const bidder2Response = await request(app.getHttpServer())
        .post('/auth/register')
        .send({
          email: 'bidder2@example.com',
          password: 'password123',
          name: 'Bidder 2',
        })
        .expect(201);

      const ownerToken = ownerResponse.body.access_token;
      const bidder1Token = bidder1Response.body.access_token;
      const bidder2Token = bidder2Response.body.access_token;

      // Step 2: Create collection
      const collectionResponse = await request(app.getHttpServer())
        .post('/collections')
        .set('Authorization', `Bearer ${ownerToken}`)
        .send({
          name: 'Digital Art Collection',
          description: 'Rare digital artwork',
          stocks: 5,
          price: 1000.0,
        })
        .expect(201);

      const collectionId = collectionResponse.body.id;

      // Step 3: Get all collections
      const collectionsResponse = await request(app.getHttpServer())
        .get('/collections')
        .set('Authorization', `Bearer ${bidder1Token}`)
        .expect(200);

      expect(collectionsResponse.body).toHaveLength(1);
      expect(collectionsResponse.body[0]).toMatchObject({
        id: collectionId,
        name: 'Digital Art Collection',
        user: {
          name: 'Collection Owner',
          email: 'owner@example.com',
        },
      });

      // Step 4: Create bids
      const bid1Response = await request(app.getHttpServer())
        .post('/bids')
        .set('Authorization', `Bearer ${bidder1Token}`)
        .send({
          collectionId,
          price: 1200.0,
        })
        .expect(201);

      const bid2Response = await request(app.getHttpServer())
        .post('/bids')
        .set('Authorization', `Bearer ${bidder2Token}`)
        .send({
          collectionId,
          price: 1300.0,
        })
        .expect(201);

      const bid1Id = bid1Response.body.id;
      const bid2Id = bid2Response.body.id;

      // Step 5: Get bids for collection
      const bidsResponse = await request(app.getHttpServer())
        .get(`/bids?collectionId=${collectionId}`)
        .set('Authorization', `Bearer ${ownerToken}`)
        .expect(200);

      expect(bidsResponse.body).toHaveLength(2);
      expect(bidsResponse.body).toEqual(
        expect.arrayContaining([
          expect.objectContaining({
            id: bid1Id,
            price: 1200.0,
            status: 'PENDING',
            user: expect.objectContaining({
              name: 'Bidder 1',
              email: 'bidder1@example.com',
            }),
          }),
          expect.objectContaining({
            id: bid2Id,
            price: 1300.0,
            status: 'PENDING',
            user: expect.objectContaining({
              name: 'Bidder 2',
              email: 'bidder2@example.com',
            }),
          }),
        ]),
      );

      // Step 6: Update a bid
      const updatedBid1Response = await request(app.getHttpServer())
        .patch(`/bids/${bid1Id}`)
        .set('Authorization', `Bearer ${bidder1Token}`)
        .send({
          price: 1400.0,
        })
        .expect(200);

      expect(updatedBid1Response.body).toMatchObject({
        id: bid1Id,
        price: 1400.0,
        status: 'PENDING',
      });

      // Step 7: Owner accepts the higher bid
      const acceptResponse = await request(app.getHttpServer())
        .post(`/bids/accept/${collectionId}/${bid1Id}`)
        .set('Authorization', `Bearer ${ownerToken}`)
        .expect(200);

      expect(acceptResponse.body).toMatchObject({
        acceptedBid: {
          id: bid1Id,
          status: 'ACCEPTED',
          price: 1400.0,
        },
        message: expect.stringContaining('accepted successfully'),
      });

      // Step 8: Verify bid statuses
      const finalBidsResponse = await request(app.getHttpServer())
        .get(`/bids?collectionId=${collectionId}`)
        .set('Authorization', `Bearer ${ownerToken}`)
        .expect(200);

      const acceptedBid = finalBidsResponse.body.find(
        (bid) => bid.id === bid1Id,
      );
      const rejectedBid = finalBidsResponse.body.find(
        (bid) => bid.id === bid2Id,
      );

      expect(acceptedBid.status).toBe('ACCEPTED');
      expect(rejectedBid.status).toBe('REJECTED');

      // Step 9: Verify user profiles
      const ownerProfileResponse = await request(app.getHttpServer())
        .get('/auth/profile')
        .set('Authorization', `Bearer ${ownerToken}`)
        .expect(200);

      expect(ownerProfileResponse.body).toMatchObject({
        name: 'Collection Owner',
        email: 'owner@example.com',
        role: 'USER',
      });

      // Step 10: Try to update accepted/rejected bids (should fail)
      await request(app.getHttpServer())
        .patch(`/bids/${bid1Id}`)
        .set('Authorization', `Bearer ${bidder1Token}`)
        .send({
          price: 1500.0,
        })
        .expect(400);

      await request(app.getHttpServer())
        .patch(`/bids/${bid2Id}`)
        .set('Authorization', `Bearer ${bidder2Token}`)
        .send({
          price: 1600.0,
        })
        .expect(400);

      // Step 11: Try to delete accepted/rejected bids (should fail)
      await request(app.getHttpServer())
        .delete(`/bids/${bid1Id}`)
        .set('Authorization', `Bearer ${bidder1Token}`)
        .expect(400);

      await request(app.getHttpServer())
        .delete(`/bids/${bid2Id}`)
        .set('Authorization', `Bearer ${bidder2Token}`)
        .expect(400);
    });

    it('should handle unauthorized access attempts', async () => {
      // Register users
      const ownerResponse = await request(app.getHttpServer())
        .post('/auth/register')
        .send({
          email: 'owner@example.com',
          password: 'password123',
          name: 'Collection Owner',
        });

      const bidderResponse = await request(app.getHttpServer())
        .post('/auth/register')
        .send({
          email: 'bidder@example.com',
          password: 'password123',
          name: 'Bidder',
        });

      const ownerToken = ownerResponse.body.access_token;
      const bidderToken = bidderResponse.body.access_token;

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

      const collectionId = collectionResponse.body.id;

      // Create bid
      const bidResponse = await request(app.getHttpServer())
        .post('/bids')
        .set('Authorization', `Bearer ${bidderToken}`)
        .send({
          collectionId,
          price: 1200.0,
        });

      const bidId = bidResponse.body.id;

      // Try to update collection with wrong user
      await request(app.getHttpServer())
        .patch(`/collections/${collectionId}`)
        .set('Authorization', `Bearer ${bidderToken}`)
        .send({
          name: 'Unauthorized Update',
        })
        .expect(403);

      // Try to delete collection with wrong user
      await request(app.getHttpServer())
        .delete(`/collections/${collectionId}`)
        .set('Authorization', `Bearer ${bidderToken}`)
        .expect(403);

      // Try to accept bid with wrong user
      await request(app.getHttpServer())
        .post(`/bids/accept/${collectionId}/${bidId}`)
        .set('Authorization', `Bearer ${bidderToken}`)
        .expect(403);

      // Try to update bid with wrong user
      await request(app.getHttpServer())
        .patch(`/bids/${bidId}`)
        .set('Authorization', `Bearer ${ownerToken}`)
        .send({
          price: 1300.0,
        })
        .expect(403);

      // Try to delete bid with wrong user
      await request(app.getHttpServer())
        .delete(`/bids/${bidId}`)
        .set('Authorization', `Bearer ${ownerToken}`)
        .expect(403);
    });

    it('should handle validation errors', async () => {
      // Register user
      const userResponse = await request(app.getHttpServer())
        .post('/auth/register')
        .send({
          email: 'user@example.com',
          password: 'password123',
          name: 'User',
        });

      const userToken = userResponse.body.access_token;

      // Invalid collection creation
      await request(app.getHttpServer())
        .post('/collections')
        .set('Authorization', `Bearer ${userToken}`)
        .send({
          name: '',
          stocks: -1,
          price: -100,
        })
        .expect(400);

      // Invalid bid creation
      await request(app.getHttpServer())
        .post('/bids')
        .set('Authorization', `Bearer ${userToken}`)
        .send({
          collectionId: 'invalid-id',
          price: -100,
        })
        .expect(400);

      // Invalid user creation
      await request(app.getHttpServer())
        .post('/users')
        .send({
          email: 'invalid-email',
          password: '123',
          name: '',
        })
        .expect(400);
    });
  });
});
