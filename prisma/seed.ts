import { PrismaClient, BidStatus } from '@prisma/client';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {

  const users = [];
  for (let i = 1; i <= 10; i++) {
    const hashedPassword = await bcrypt.hash('password123', 10);
    const user = await prisma.user.upsert({
      where: { email: `user${i}@example.com` },
      update: {},
      create: {
        email: `user${i}@example.com`,
        password: hashedPassword,
        name: `User ${i}`,
        role: 'USER',
      },
    });
    users.push(user);
  }

  const collections = [];
  const collectionNames = [
    'Rare Digital Art Collection',
    'Vintage Photography Series',
    'Abstract Paintings Collection',
    'Modern Sculpture Gallery',
    'Street Art Compilation',
    'Nature Photography Bundle',
    'Portrait Photography Set',
    'Landscape Art Collection',
    'Contemporary Art Series',
    'Digital NFT Bundle',
    'Minimalist Art Collection',
    'Pop Art Gallery',
    'Watercolor Paintings Set',
    'Black & White Photography',
    'Surreal Art Collection',
    'Urban Art Series',
    'Classical Paintings Bundle',
    'Digital Illustrations Set',
    'Mixed Media Collection',
    'Experimental Art Series',
    'Vintage Poster Collection',
    'Typography Art Bundle',
    'Geometric Art Series',
    'Botanical Illustrations',
    'Architectural Photography',
    'Fashion Photography Set',
    'Food Photography Bundle',
    'Travel Photography Series',
    'Wildlife Photography Collection',
    'Macro Photography Set',
    'Drone Photography Bundle',
    'Fine Art Prints Collection',
    'Conceptual Art Series',
    'Interactive Art Bundle',
    'Video Art Collection',
    'Sound Art Series',
    'Performance Art Documentation',
    'Installation Art Photos',
    'Sculpture Photography Set',
    'Textile Art Collection',
    'Ceramic Art Series',
    'Glass Art Bundle',
    'Metal Art Collection',
    'Wood Art Series',
    'Paper Art Collection',
    'Collage Art Bundle',
    'Printmaking Series',
    'Etching Art Collection',
    'Lithography Prints Set',
    'Screen Print Bundle',
    'Monotype Art Series',
    'Linocut Collection',
    'Woodcut Art Bundle',
    'Engraving Series',
    'Mixed Print Collection',
    'Digital Print Bundle',
    'Photomontage Series',
    'Assemblage Art Collection',
    'Found Object Art Bundle',
    'Kinetic Art Series',
    'Light Art Collection',
    'Projection Art Bundle',
    'Holographic Art Series',
    'Augmented Reality Art',
    'Virtual Reality Collection',
    'AI Generated Art Bundle',
    'Generative Art Series',
    'Algorithmic Art Collection',
    'Procedural Art Bundle',
    'Interactive Digital Art',
    'Motion Graphics Collection',
    '3D Art Series',
    'Animation Art Bundle',
    'Character Design Collection',
    'Concept Art Series',
    'Storyboard Art Bundle',
    'Comic Art Collection',
    'Manga Art Series',
    'Graphic Novel Bundle',
    'Illustration Collection',
    'Children Book Art Series',
    'Editorial Illustration Bundle',
    'Scientific Illustration Set',
    'Technical Drawing Collection',
    'Architectural Sketches',
    'Fashion Design Sketches',
    'Product Design Drawings',
    'Industrial Design Collection',
    'Logo Design Bundle',
    'Brand Identity Series',
    'Packaging Design Collection',
    'Web Design Art Bundle',
    'UI/UX Design Series',
    'Icon Design Collection',
    'Pattern Design Bundle',
    'Textile Pattern Series'
  ];

  const descriptions = [
    'A curated collection of unique artworks',
    'Featuring exclusive pieces from renowned artists',
    'Limited edition collection with certificate of authenticity',
    'Handpicked selection of contemporary works',
    'Rare finds from emerging artists',
    'Premium quality digital assets',
    'Collector edition with special provenance',
    'Museum quality reproductions',
    'Signed and numbered limited series',
    'Exclusive access to private collection'
  ];

  for (let i = 0; i < 100; i++) {
    const randomUser = users[Math.floor(Math.random() * users.length)];
    const randomName = collectionNames[i] || `Collection ${i + 1}`;
    const randomDescription = descriptions[Math.floor(Math.random() * descriptions.length)];
    const randomPrice = Math.floor(Math.random() * 5000) + 100;
    const randomStocks = Math.floor(Math.random() * 50) + 1;

    const collection = await prisma.collection.create({
      data: {
        name: randomName,
        description: randomDescription,
        price: randomPrice,
        stocks: randomStocks,
        userId: randomUser.id,
      },
    });
    collections.push(collection);
  }

  for (const collection of collections) {
    const numBids = Math.floor(Math.random() * 15) + 10;

    for (let j = 0; j < numBids; j++) {
      let randomUser;
      do {
        randomUser = users[Math.floor(Math.random() * users.length)];
      } while (randomUser.id === collection.userId);

      const existingBid = await prisma.bid.findFirst({
        where: {
          collectionId: collection.id,
          userId: randomUser.id,
          status: 'PENDING',
        },
      });

      if (!existingBid) {
        const bidPrice = collection.price + Math.floor(Math.random() * 1000) - 500;
        const finalBidPrice = bidPrice > 0 ? bidPrice : collection.price + 50;

        const statuses = ['PENDING', 'PENDING', 'PENDING', 'REJECTED'];
        const randomStatus = statuses[Math.floor(Math.random() * statuses.length)];

        await prisma.bid.create({
          data: {
            collectionId: collection.id,
            price: finalBidPrice,
            userId: randomUser.id,
            status: randomStatus as BidStatus,
          },
        });
      }
    }
  }

  const bidCount = await prisma.bid.count();
}

main()
  .catch((e) => {
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
