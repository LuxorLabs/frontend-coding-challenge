# Code Challenge: Bidding System

### Using NextJS build a simple bidding system with the following criteria

```
# Base Schema (feel free to add more columns as you see fits):
collections {
    id,
    name,
    descriptions,
    stocks (qty),
    price,
},
bids {
    id,
    collection_id,
    price,
    user_id,
    status (pending, accepted, rejected),
}
user {
    id,
    name,
    email
}
```

1. Create a dataset base on schema above.
    - atleast 100 collections
    - atleast 10 bids per collection
    - atleast 10 users
    - you can use an orm like prisma or drizzle connected to a postgres db,
    - or just use json file as mock data.
2. Create an endpoint to fetch the following (can be Nextjs Api or RSC/Server Action)
    - list of collections
    - list of bids, params: collection_id
    - create/update/delete collection
    - create/update/delete bid
    - accept bid (should reject other bids), params: collection_id, bid_id
3. Create a nested table/section to display the list of collections, with
    - list of bids under each collection
    - if collection owner
        - an icon/button to update/delete collection 
        - an icon/button to accept bid
    - otherwise, an icon/button to add/edit/cancel bid
4. Forms (modals or page): create/update collection, create/update bid


### Example Layout
![image](https://github.com/LuxorLabs/frontend-coding-challenge/assets/22500561/1fa87d6d-946c-478b-bcd7-3d22dfaee398)

***Design is just an example, you can do nested cards or nested table or others, totally up to you***
***Feel free to utilize [shadcn](ui.shadcn.com) and other ui lib for the frontend part.***

### Judging Criteria
- Code Quality
- Code Structure
- UX
- Performance (how you render components and call api)
- Authentication is optional (feel free to mock users), bonus if you can implement it.
