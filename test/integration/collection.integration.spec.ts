import {INestApplication} from '@nestjs/common';
import {Test, TestingModule} from '@nestjs/testing';
import {ValidationPipe} from '@nestjs/common';
import * as request from 'supertest';
import {AppModule} from '../../src/app.module';
import {PrismaService} from '../../src/prisma/prisma.service';

describe('CollectionController (Integration)', () => {
  let app: INestApplication;
  let prisma: PrismaService;
  let ownerToken: string;
  let otherUserToken: string;
  let ownerId: string;
  let otherUserId: string;

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

    // Create other user
    const otherResponse = await request(app.getHttpServer())
      .post('/auth/register')
      .send({
        email: 'other@example.com',
        password: 'password123',
        name: 'Other User',
      });

    otherUserToken = otherResponse.body.access_token;
    otherUserId = otherResponse.body.user.id;
  });

  afterAll(async () => {
    await prisma.bid.deleteMany();
    await prisma.collection.deleteMany();
    await prisma.user.deleteMany();
    await app.close();
  });

  describe('POST /collections', () => {
    it('should create a collection successfully', async () => {
      const createDto = {
        name: 'Digital Art Collection',
        description: 'A unique collection',
        stocks: 10,
        price: 1000.0,
      };

      const response = await request(app.getHttpServer())
        .post('/collections')
        .set('Authorization', `Bearer ${ownerToken}`)
        .send(createDto)
        .expect(201);

      expect(response.body).toMatchObject({
        name: createDto.name,
        description: createDto.description,
        stocks: createDto.stocks,
        price: createDto.price,
        user: {
          id: ownerId,
          name: 'Collection Owner',
          email: 'owner@example.com',
        },
      });
    });

    it('should return 401 without authentication', async () => {
      const createDto = {
        name: 'Digital Art Collection',
        description: 'A unique collection',
        stocks: 10,
        price: 1000.0,
      };

      await request(app.getHttpServer())
        .post('/collections')
        .send(createDto)
        .expect(401);
    });

    it('should return 400 for invalid data', async () => {
      const createDto = {
        name: '',
        stocks: -1,
        price: -100,
      };

      await request(app.getHttpServer())
        .post('/collections')
        .set('Authorization', `Bearer ${ownerToken}`)
        .send(createDto)
        .expect(400);
    });
  });

  describe('GET /collections', () => {
    beforeEach(async () => {
      await request(app.getHttpServer())
        .post('/collections')
        .set('Authorization', `Bearer ${ownerToken}`)
        .send({
          name: 'Test Collection',
          description: 'Test Description',
          stocks: 5,
          price: 500.0,
        });
    });

    it('should return all collections with user and bids', async () => {
      const response = await request(app.getHttpServer())
        .get('/collections')
        .set('Authorization', `Bearer ${ownerToken}`)
        .expect(200);

      expect(response.body).toHaveLength(1);
      expect(response.body[0]).toMatchObject({
        name: 'Test Collection',
        user: {
          id: ownerId,
          name: 'Collection Owner',
          email: 'owner@example.com',
        },
        bids: [],
      });
    });

    it('should return 401 without authentication', async () => {
      await request(app.getHttpServer()).get('/collections').expect(401);
    });
  });

  describe('GET /collections/:id', () => {
    let collectionId: string;

    beforeEach(async () => {
      const response = await request(app.getHttpServer())
        .post('/collections')
        .set('Authorization', `Bearer ${ownerToken}`)
        .send({
          name: 'Test Collection',
          description: 'Test Description',
          stocks: 5,
          price: 500.0,
        });

      collectionId = response.body.id;
    });

    it('should return collection by ID', async () => {
      const response = await request(app.getHttpServer())
        .get(`/collections/${collectionId}`)
        .set('Authorization', `Bearer ${ownerToken}`)
        .expect(200);

      expect(response.body).toMatchObject({
        id: collectionId,
        name: 'Test Collection',
      });
    });

    it('should return 404 for non-existent collection', async () => {
      await request(app.getHttpServer())
        .get('/collections/non-existent-id')
        .set('Authorization', `Bearer ${ownerToken}`)
        .expect(404);
    });
  });

  describe('PATCH /collections/:id', () => {
    let collectionId: string;

    beforeEach(async () => {
      const response = await request(app.getHttpServer())
        .post('/collections')
        .set('Authorization', `Bearer ${ownerToken}`)
        .send({
          name: 'Test Collection',
          description: 'Test Description',
          stocks: 5,
          price: 500.0,
        });

      collectionId = response.body.id;
    });

    it('should update collection by owner', async () => {
      const updateDto = {
        name: 'Updated Collection',
        price: 600.0,
      };

      const response = await request(app.getHttpServer())
        .patch(`/collections/${collectionId}`)
        .set('Authorization', `Bearer ${ownerToken}`)
        .send(updateDto)
        .expect(200);

      expect(response.body).toMatchObject({
        id: collectionId,
        name: 'Updated Collection',
        price: 600.0,
      });
    });

    it('should return 403 when non-owner tries to update', async () => {
      const updateDto = {
        name: 'Unauthorized Update',
      };

      await request(app.getHttpServer())
        .patch(`/collections/${collectionId}`)
        .set('Authorization', `Bearer ${otherUserToken}`)
        .send(updateDto)
        .expect(403);
    });

    it('should return 404 for non-existent collection', async () => {
      await request(app.getHttpServer())
        .patch('/collections/non-existent-id')
        .set('Authorization', `Bearer ${ownerToken}`)
        .send({name: 'Update'})
        .expect(404);
    });
  });

  describe('DELETE /collections/:id', () => {
    let collectionId: string;

    beforeEach(async () => {
      const response = await request(app.getHttpServer())
        .post('/collections')
        .set('Authorization', `Bearer ${ownerToken}`)
        .send({
          name: 'Test Collection',
          description: 'Test Description',
          stocks: 5,
          price: 500.0,
        });

      collectionId = response.body.id;
    });

    it('should delete collection by owner', async () => {
      await request(app.getHttpServer())
        .delete(`/collections/${collectionId}`)
        .set('Authorization', `Bearer ${ownerToken}`)
        .expect(204);

      await request(app.getHttpServer())
        .get(`/collections/${collectionId}`)
        .set('Authorization', `Bearer ${ownerToken}`)
        .expect(404);
    });

    it('should return 403 when non-owner tries to delete', async () => {
      await request(app.getHttpServer())
        .delete(`/collections/${collectionId}`)
        .set('Authorization', `Bearer ${otherUserToken}`)
        .expect(403);
    });

    it('should return 404 for non-existent collection', async () => {
      await request(app.getHttpServer())
        .delete('/collections/non-existent-id')
        .set('Authorization', `Bearer ${ownerToken}`)
        .expect(404);
    });
  });
});
