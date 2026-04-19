# UniShare — Complete Backend Building Plan
> P2P Student Rental Platform · Spring Boot · MySQL

---

## Table of Contents

1. [Project Overview](#1-project-overview)
2. [Tech Stack](#2-tech-stack)
3. [Architecture](#3-architecture)
4. [Database Schema](#4-database-schema)
5. [Package Structure](#5-package-structure)
6. [Weekly Build Plan](#6-weekly-build-plan)
   - [Week 1 — Security Foundation](#week-1--security-foundation)
   - [Week 2 — Core Features](#week-2--core-features)
   - [Week 3 — Advanced Features](#week-3--advanced-features)
   - [Week 4 — Polish & Production](#week-4--polish--production)
7. [API Endpoints Reference](#7-api-endpoints-reference)
8. [Security Model](#8-security-model)
9. [Complete File Map](#9-complete-file-map)

---

## 1. Project Overview

**UniShare** is a peer-to-peer rental platform exclusively for university students. Students rent items to each other — textbooks, electronics, furniture, and more — using their `.edu` email as proof of student identity.

### Core Business Rules
- Only `.edu` email addresses can register, or with the student university ID, will decide in time
- Every user has one of two roles: `STUDENT` or `ADMIN`
- Listings can be browsed publicly, but booking requires authentication
- A booking cannot overlap with an existing confirmed booking for the same listing
- Two Payment option: one pay online which must be completed before a booking is confirmed, and the other option in cash
- Reviews can only be left after a booking is `COMPLETED`
- Meetup locations are pre-seeded safe spots on campus

---

## 2. Tech Stack

### Runtime & Framework
| Technology | Version | Purpose |
|---|---|---|
| Java | 21 | Language (LTS, virtual threads ready) |
| Spring Boot | 3.4.x | Framework, auto-configuration |
| Spring Web | 3.4.x | REST controllers, request mapping |
| Spring Security | 3.4.x | Authentication, authorization, filter chain |
| Spring Data JPA | 3.4.x | ORM layer, repository pattern |
| Hibernate | 6.x | JPA implementation |

### Database
| Technology | Version | Purpose |
|---|---|---|
| MySQL | 8.x | Primary relational database |
| Flyway | 10.x | Database migration versioning |
| HikariCP | Built-in | Connection pooling (Spring Boot default) |

### Security
| Library | Version | Purpose |
|---|---|---|
| JJWT (io.jsonwebtoken) | 0.12.x | JWT generation, signing, validation |
| BCrypt | Built-in | Password hashing |

### Developer Productivity
| Library | Version | Purpose |
|---|---|---|
| Lombok | Latest | Eliminates boilerplate (getters, builders, constructors) |
| MapStruct | 1.5.x | Type-safe entity ↔ DTO mapping |
| SpringDoc OpenAPI | 2.x | Auto-generates Swagger UI from code |

### Build & Config
| Tool | Purpose |
|---|---|
| Maven | Dependency management, build lifecycle |
| application.yaml | Hierarchical Spring Boot configuration |
| .env | Externalized secrets (never committed to git) |

---

## 3. Architecture

### Layered Architecture (Request Flow)

```
HTTP Request
     │
     ▼
┌─────────────────────────────────┐
│   JwtAuthenticationFilter       │  ← Intercepts every request
│   Extracts + validates JWT      │    Sets SecurityContext
└────────────┬────────────────────┘
             │
             ▼
┌─────────────────────────────────┐
│   Controller Layer              │  ← @RestController
│   Receives HTTP, delegates      │    Validates input (@Valid)
│   Returns ResponseEntity        │    Maps routes
└────────────┬────────────────────┘
             │
             ▼
┌─────────────────────────────────┐
│   Service Layer                 │  ← @Service
│   Business logic lives here     │    @PreAuthorize (RBAC)
│   Calls repositories            │    Throws domain exceptions
└────────────┬────────────────────┘
             │
             ▼
┌─────────────────────────────────┐
│   Repository Layer              │  ← @Repository (JPA)
│   Spring Data interfaces        │    Custom JPQL queries
│   Zero boilerplate CRUD         │    Overlap detection query
└────────────┬────────────────────┘
             │
             ▼
┌─────────────────────────────────┐
│   MySQL Database                │  ← Managed by Flyway
│   Versioned schema migrations   │    Indexed for performance
└─────────────────────────────────┘
```

### Cross-Cutting Concerns

```
Every layer is wrapped by:

GlobalExceptionHandler (@RestControllerAdvice)
  └── Catches ALL exceptions
  └── Returns consistent ErrorResponse JSON
  └── Maps validation errors to fieldErrors map

SecurityConfig
  └── Stateless session (no cookies)
  └── JWT filter before every request
  └── Public vs protected routes defined in one place
```

---

## 4. Database Schema

### Tables

```sql
users
├── id              BIGINT PK AUTO_INCREMENT
├── full_name       VARCHAR(100) NOT NULL
├── email           VARCHAR(150) UNIQUE NOT NULL        ← personal email
├── university_email VARCHAR(150) UNIQUE NOT NULL       ← must be .edu
├── password_hash   VARCHAR(255) NOT NULL
├── role            ENUM('STUDENT','ADMIN') NOT NULL
├── profile_picture VARCHAR(500)
├── phone           VARCHAR(20)
├── created_at      DATETIME NOT NULL
└── updated_at      DATETIME NOT NULL

listings
├── id              BIGINT PK AUTO_INCREMENT
├── owner_id        BIGINT FK → users.id
├── title           VARCHAR(200) NOT NULL
├── description     TEXT
├── price_per_day   DECIMAL(10,2) NOT NULL
├── category        ENUM('TEXTBOOKS','ELECTRONICS','FURNITURE','CLOTHING','OTHER')
├── condition       ENUM('NEW','LIKE_NEW','GOOD','FAIR')
├── status          ENUM('AVAILABLE','RENTED','INACTIVE')
├── created_at      DATETIME NOT NULL
└── updated_at      DATETIME NOT NULL

listing_images
├── id              BIGINT PK AUTO_INCREMENT
├── listing_id      BIGINT FK → listings.id
├── image_url       VARCHAR(500) NOT NULL
└── display_order   INT NOT NULL DEFAULT 0

bookings
├── id              BIGINT PK AUTO_INCREMENT
├── listing_id      BIGINT FK → listings.id
├── renter_id       BIGINT FK → users.id
├── start_date      DATE NOT NULL
├── end_date        DATE NOT NULL
├── total_price     DECIMAL(10,2) NOT NULL
├── status          ENUM('PENDING','CONFIRMED','CANCELLED','COMPLETED')
├── meetup_location_id BIGINT FK → meetup_locations.id
├── created_at      DATETIME NOT NULL
└── updated_at      DATETIME NOT NULL

-- Critical index for overlap detection:
INDEX idx_bookings_overlap (listing_id, start_date, end_date, status)

payments
├── id              BIGINT PK AUTO_INCREMENT
├── booking_id      BIGINT FK → bookings.id UNIQUE
├── amount          DECIMAL(10,2) NOT NULL
├── status          ENUM('PENDING','PAID','REFUNDED')
├── payment_method  VARCHAR(50)
├── transaction_ref VARCHAR(200)
├── paid_at         DATETIME
├── created_at      DATETIME NOT NULL
└── updated_at      DATETIME NOT NULL

reviews
├── id              BIGINT PK AUTO_INCREMENT
├── booking_id      BIGINT FK → bookings.id
├── reviewer_id     BIGINT FK → users.id
├── reviewee_id     BIGINT FK → users.id
├── listing_id      BIGINT FK → listings.id
├── rating          TINYINT NOT NULL  (1–5)
├── comment         TEXT
├── type            ENUM('OWNER_TO_RENTER','RENTER_TO_OWNER')
├── created_at      DATETIME NOT NULL
└── updated_at      DATETIME NOT NULL

chat_messages
├── id              BIGINT PK AUTO_INCREMENT
├── sender_id       BIGINT FK → users.id
├── receiver_id     BIGINT FK → users.id
├── listing_id      BIGINT FK → listings.id  (context)
├── content         TEXT NOT NULL
├── is_read         BOOLEAN DEFAULT FALSE
└── created_at      DATETIME NOT NULL

meetup_locations
├── id              BIGINT PK AUTO_INCREMENT
├── name            VARCHAR(200) NOT NULL
├── description     VARCHAR(500)
├── address         VARCHAR(300)
├── is_active       BOOLEAN DEFAULT TRUE
├── created_at      DATETIME NOT NULL
└── updated_at      DATETIME NOT NULL
```

### Entity Relationships

```
User ──────────────< Listing         (one user owns many listings)
User ──────────────< Booking         (one user makes many bookings)
Listing ───────────< Booking         (one listing has many bookings)
Listing ───────────< ListingImage    (one listing has many images)
Booking ───────────1 Payment         (one booking has one payment)
Booking ───────────< Review          (one booking can have two reviews)
User ──────────────< ChatMessage     (sender)
User ──────────────< ChatMessage     (receiver)
MeetupLocation ────< Booking         (one location used in many bookings)
```

---

## 5. Package Structure

```
com.unishare/
├── config/
│   ├── SecurityConfig.java          ← Filter chain, RBAC rules, session management
│   └── SwaggerConfig.java           ← JWT bearer auth in Swagger UI
│
├── controllers/
│   ├── AuthController.java          ← POST /api/auth/register, /login
│   ├── UserController.java          ← GET/PUT /api/users
│   ├── ListingController.java       ← CRUD /api/listings
│   ├── BookingController.java       ← CRUD /api/bookings
│   ├── PaymentController.java       ← POST /api/payments
│   ├── ReviewController.java        ← POST /api/reviews
│   ├── ChatController.java          ← GET/POST /api/chat
│   ├── MeetupLocationController.java← GET /api/meetup-locations
│   └── AdminController.java         ← /api/admin/**
│
├── services/
│   ├── JwtService.java              ← Generate, validate, extract claims
│   ├── UserDetailsServiceImpl.java  ← Load user by email for Spring Security
│   ├── AuthService.java             ← register(), login()
│   ├── UserService.java             ← getProfile(), updateProfile(), changePassword()
│   ├── ListingService.java          ← Business logic for listings + image upload
│   ├── BookingService.java          ← create booking + overlap detection
│   ├── PaymentService.java          ← processPayment(), refund()
│   ├── ReviewService.java           ← createReview() after COMPLETED booking
│   ├── ChatService.java             ← getConversation(), sendMessage()
│   └── AdminService.java            ← dashboard stats, user/listing management
│
├── repositories/
│   ├── UserRepository.java
│   ├── ListingRepository.java       ← search/filter queries
│   ├── BookingRepository.java       ← overlap detection JPQL query
│   ├── PaymentRepository.java
│   ├── ReviewRepository.java        ← average rating query
│   ├── ChatMessageRepository.java   ← conversation query
│   └── MeetupLocationRepository.java
│
├── entities/
│   ├── enums/
│   │   ├── Role.java
│   │   ├── ListingStatus.java
│   │   ├── ListingCategory.java
│   │   ├── ItemCondition.java
│   │   ├── BookingStatus.java
│   │   ├── PaymentStatus.java
│   │   └── ReviewType.java
│   ├── User.java
│   ├── Listing.java
│   ├── ListingImage.java
│   ├── Booking.java
│   ├── Payment.java
│   ├── Review.java
│   ├── ChatMessage.java
│   └── MeetupLocation.java
│
├── dtos/
│   ├── auth/
│   │   ├── RegisterRequest.java
│   │   ├── LoginRequest.java
│   │   └── JwtResponse.java
│   ├── user/
│   │   ├── UserDto.java
│   │   ├── UpdateProfileRequest.java
│   │   └── ChangePasswordRequest.java
│   ├── listing/
│   │   ├── ListingDto.java
│   │   ├── CreateListingRequest.java
│   │   └── UpdateListingRequest.java
│   ├── booking/
│   │   ├── BookingDto.java
│   │   └── CreateBookingRequest.java
│   ├── payment/
│   │   ├── PaymentDto.java
│   │   └── ProcessPaymentRequest.java
│   ├── review/
│   │   ├── ReviewDto.java
│   │   └── CreateReviewRequest.java
│   ├── chat/
│   │   ├── ChatMessageDto.java
│   │   └── SendMessageRequest.java
│   └── ErrorResponse.java
│
├── filters/
│   └── JwtAuthenticationFilter.java ← OncePerRequestFilter, sets SecurityContext
│
├── exceptions/
│   ├── EmailAlreadyExistsException.java
│   ├── UserNotFoundException.java
│   ├── ListingNotFoundException.java
│   ├── BookingNotFoundException.java
│   ├── BookingOverlapException.java
│   ├── PaymentAlreadyExistsException.java
│   ├── ReviewNotAllowedException.java
│   ├── UnauthorizedActionException.java
│   └── handler/
│       └── GlobalExceptionHandler.java  ← @RestControllerAdvice
│
├── validation/
│   ├── EduEmail.java                ← custom @EduEmail annotation
│   └── EduEmailValidator.java       ← validates email ends in .edu
│
└── mappers/                         ← MapStruct interfaces
    ├── UserMapper.java
    ├── ListingMapper.java
    ├── BookingMapper.java
    ├── PaymentMapper.java
    ├── ReviewMapper.java
    └── ChatMapper.java
```

---

## 6. Weekly Build Plan

### Week 1 — Security Foundation

> **Goal:** A fully secured API where registration, login, JWT auth, and RBAC all work correctly.

| Day | Focus | Key Deliverable |
|---|---|---|
| Day 1 | Project bootstrap | App starts, MySQL connects, packages created |
| Day 2 | Database schema | Flyway migration, all tables, indexes, seed data |
| Day 3 | JPA entities + repositories | Full data layer, Hibernate validates schema |
| Day 4 | JWT service + auth filter | Token generation, validation, SecurityContext |
| Day 5 | Spring Security config | Filter chain, public/protected routes, RBAC rules |
| Day 6 | Auth endpoints + .edu validation | Register, login, custom @EduEmail validator |
| Day 7 | User API + GlobalExceptionHandler + Swagger | Profile, password change, consistent errors, Swagger UI |

**End of Week 1:** A non-.edu email is rejected, login returns a signed JWT, every protected route enforces authentication, roles are embedded in the token, and all errors return one consistent JSON format.

---

### Week 2 — Core Features

> **Goal:** The main rental workflow — listings, bookings, and payments — fully functional.

| Day | Focus | Key Deliverable |
|---|---|---|
| Day 8  | Listing CRUD | Create, read, update, delete listings with auth |
| Day 9  | Listing search & filters | Filter by category, condition, price, pagination |
| Day 10 | Image upload | Multipart file upload, store images per listing |
| Day 11 | Booking creation + overlap detection | Core JPQL overlap query, prevent double-booking |
| Day 12 | Booking management | Cancel, confirm, complete bookings by role |
| Day 13 | Payment processing | Payment flow tied to booking confirmation |
| Day 14 | Week 2 integration test | All features tested end-to-end via Swagger |

**End of Week 2:** A student can post a listing, another student can book it for a date range, payment is processed, and no two bookings can overlap.

---

### Week 3 — Advanced Features

> **Goal:** Reviews, chat, admin panel, and meetup locations.

| Day | Focus | Key Deliverable |
|---|---|---|
| Day 15 | Reviews system | Leave review only after COMPLETED booking |
| Day 16 | Average rating on listings | Aggregate query, rating shown on listing detail |
| Day 17 | Chat system | Message between renter and owner per listing |
| Day 18 | Meetup locations API | Seed data, list locations, attach to booking |
| Day 19 | Admin — user management | View all users, activate/deactivate accounts |
| Day 20 | Admin — listing moderation | Approve, reject, deactivate listings |
| Day 21 | Admin dashboard stats | Total users, listings, bookings, revenue |

**End of Week 3:** Full platform features working — reviews, chat, admin control panel with stats.

---

### Week 4 — Polish & Production

> **Goal:** The backend is hardened, documented, and ready to connect to the frontend.

| Day | Focus | Key Deliverable |
|---|---|---|
| Day 22 | Input validation audit | Every DTO has correct constraints, no gaps |
| Day 23 | Exception handling audit | Every edge case returns correct HTTP status |
| Day 24 | Security audit | No endpoint leaks data it shouldn't |
| Day 25 | Performance — query optimization | N+1 detection, fetch strategy review |
| Day 26 | Full Swagger documentation | Every endpoint documented with examples |
| Day 27 | Environment config cleanup | Prod vs dev profiles, secrets management |
| Day 28 | Final integration test | Full rental flow tested start to finish |

**End of Week 4:** A production-ready Spring Boot backend — hardened, documented, and ready for the React frontend to consume.

---

## 7. API Endpoints Reference

### Auth
| Method | Endpoint | Access | Description |
|---|---|---|---|
| POST | `/api/auth/register` | Public | Register with .edu email |
| POST | `/api/auth/login` | Public | Login, returns JWT |

### Users
| Method | Endpoint | Access | Description |
|---|---|---|---|
| GET | `/api/users/me` | Authenticated | Get own profile |
| PUT | `/api/users/me` | Authenticated | Update profile |
| PUT | `/api/users/me/password` | Authenticated | Change password |

### Listings
| Method | Endpoint | Access | Description |
|---|---|---|---|
| GET | `/api/listings` | Public | Browse listings (paginated, filterable) |
| GET | `/api/listings/{id}` | Public | Get listing detail |
| POST | `/api/listings` | STUDENT | Create a listing |
| PUT | `/api/listings/{id}` | STUDENT (owner) | Update own listing |
| DELETE | `/api/listings/{id}` | STUDENT (owner) | Delete own listing |
| POST | `/api/listings/{id}/images` | STUDENT (owner) | Upload listing images |

### Bookings
| Method | Endpoint | Access | Description |
|---|---|---|---|
| POST | `/api/bookings` | STUDENT | Create a booking |
| GET | `/api/bookings/my` | STUDENT | Get own bookings |
| GET | `/api/bookings/{id}` | STUDENT (involved) | Get booking detail |
| PUT | `/api/bookings/{id}/cancel` | STUDENT (renter) | Cancel a booking |
| PUT | `/api/bookings/{id}/confirm` | STUDENT (owner) | Confirm a booking |
| PUT | `/api/bookings/{id}/complete` | STUDENT (owner) | Mark as completed |

### Payments
| Method | Endpoint | Access | Description |
|---|---|---|---|
| POST | `/api/payments/{bookingId}` | STUDENT (renter) | Process payment for booking |
| GET | `/api/payments/{bookingId}` | STUDENT (involved) | Get payment status |

### Reviews
| Method | Endpoint | Access | Description |
|---|---|---|---|
| POST | `/api/reviews` | STUDENT | Leave review (COMPLETED bookings only) |
| GET | `/api/reviews/listing/{id}` | Public | Get reviews for a listing |
| GET | `/api/reviews/user/{id}` | Public | Get reviews for a user |

### Chat
| Method | Endpoint | Access | Description |
|---|---|---|---|
| GET | `/api/chat/{userId}` | Authenticated | Get conversation with a user |
| POST | `/api/chat/{userId}` | Authenticated | Send a message |
| GET | `/api/chat/conversations` | Authenticated | List all conversations |

### Meetup Locations
| Method | Endpoint | Access | Description |
|---|---|---|---|
| GET | `/api/meetup-locations` | Authenticated | List all active meetup locations |

### Admin
| Method | Endpoint | Access | Description |
|---|---|---|---|
| GET | `/api/admin/users` | ADMIN | List all users |
| PUT | `/api/admin/users/{id}/deactivate` | ADMIN | Deactivate a user |
| GET | `/api/admin/listings` | ADMIN | List all listings |
| PUT | `/api/admin/listings/{id}/deactivate` | ADMIN | Deactivate a listing |
| GET | `/api/admin/stats` | ADMIN | Dashboard statistics |

---

## 8. Security Model

### JWT Token Structure
```
Header:  { alg: "HS256", typ: "JWT" }
Payload: {
  sub: "user@university.edu",    ← email (subject)
  userId: 42,                    ← user ID claim
  role: "STUDENT",               ← role claim (drives @PreAuthorize)
  iat: 1700000000,               ← issued at
  exp: 1700086400                ← expires (24h)
}
Signature: HMAC-SHA256(secret)
```

### Request Authentication Flow
```
1. Client sends:  Authorization: Bearer <token>
2. JwtAuthenticationFilter extracts token from header
3. JwtService validates signature + expiry
4. JwtService extracts email + role from claims
5. UserDetailsServiceImpl loads user from DB by email
6. GrantedAuthority set from role claim
7. SecurityContext populated → request proceeds
8. @PreAuthorize("hasRole('STUDENT')") checked at service layer
```

### Route Access Rules
```
PUBLIC (no token needed):
  GET  /api/listings/**
  POST /api/auth/register
  POST /api/auth/login
  GET  /api/reviews/listing/**
  GET  /swagger-ui/**
  GET  /v3/api-docs/**

ADMIN ONLY:
  ALL  /api/admin/**

AUTHENTICATED (any valid token):
  Everything else
```

### Error Response Contract
Every error across the entire API returns this shape:
```json
{
  "timestamp": "2024-01-15T10:30:00",
  "status": 400,
  "error": "Bad Request",
  "message": "Validation failed",
  "path": "/api/auth/register",
  "fieldErrors": {
    "universityEmail": "must be a .edu email address",
    "password": "must be at least 8 characters"
  }
}
```

---

## 9. Complete File Map

```
unishare/
├── pom.xml
├── .env                                         ← gitignored secrets
├── .gitignore
└── src/
    └── main/
        ├── resources/
        │   ├── application.yaml
        │   └── db/migration/
        │       └── V1__unishare_initial_schema.sql
        └── java/com/unishare/
            ├── UniShareApplication.java
            ├── config/
            │   ├── SecurityConfig.java
            │   └── SwaggerConfig.java
            ├── controllers/
            │   ├── AuthController.java
            │   ├── UserController.java
            │   ├── ListingController.java
            │   ├── BookingController.java
            │   ├── PaymentController.java
            │   ├── ReviewController.java
            │   ├── ChatController.java
            │   ├── MeetupLocationController.java
            │   └── AdminController.java
            ├── services/
            │   ├── JwtService.java
            │   ├── UserDetailsServiceImpl.java
            │   ├── AuthService.java
            │   ├── UserService.java
            │   ├── ListingService.java
            │   ├── BookingService.java
            │   ├── PaymentService.java
            │   ├── ReviewService.java
            │   ├── ChatService.java
            │   └── AdminService.java
            ├── repositories/
            │   ├── UserRepository.java
            │   ├── ListingRepository.java
            │   ├── BookingRepository.java
            │   ├── PaymentRepository.java
            │   ├── ReviewRepository.java
            │   ├── ChatMessageRepository.java
            │   └── MeetupLocationRepository.java
            ├── entities/
            │   ├── enums/
            │   │   ├── Role.java
            │   │   ├── ListingStatus.java
            │   │   ├── ListingCategory.java
            │   │   ├── ItemCondition.java
            │   │   ├── BookingStatus.java
            │   │   ├── PaymentStatus.java
            │   │   └── ReviewType.java
            │   ├── User.java
            │   ├── Listing.java
            │   ├── ListingImage.java
            │   ├── Booking.java
            │   ├── Payment.java
            │   ├── Review.java
            │   ├── ChatMessage.java
            │   └── MeetupLocation.java
            ├── dtos/
            │   ├── auth/
            │   │   ├── RegisterRequest.java
            │   │   ├── LoginRequest.java
            │   │   └── JwtResponse.java
            │   ├── user/
            │   │   ├── UserDto.java
            │   │   ├── UpdateProfileRequest.java
            │   │   └── ChangePasswordRequest.java
            │   ├── listing/
            │   │   ├── ListingDto.java
            │   │   ├── CreateListingRequest.java
            │   │   └── UpdateListingRequest.java
            │   ├── booking/
            │   │   ├── BookingDto.java
            │   │   └── CreateBookingRequest.java
            │   ├── payment/
            │   │   ├── PaymentDto.java
            │   │   └── ProcessPaymentRequest.java
            │   ├── review/
            │   │   ├── ReviewDto.java
            │   │   └── CreateReviewRequest.java
            │   ├── chat/
            │   │   ├── ChatMessageDto.java
            │   │   └── SendMessageRequest.java
            │   └── ErrorResponse.java
            ├── filters/
            │   └── JwtAuthenticationFilter.java
            ├── exceptions/
            │   ├── EmailAlreadyExistsException.java
            │   ├── UserNotFoundException.java
            │   ├── ListingNotFoundException.java
            │   ├── BookingNotFoundException.java
            │   ├── BookingOverlapException.java
            │   ├── PaymentAlreadyExistsException.java
            │   ├── ReviewNotAllowedException.java
            │   ├── UnauthorizedActionException.java
            │   └── handler/
            │       └── GlobalExceptionHandler.java
            ├── validation/
            │   ├── EduEmail.java
            │   └── EduEmailValidator.java
            └── mappers/
                ├── UserMapper.java
                ├── ListingMapper.java
                ├── BookingMapper.java
                ├── PaymentMapper.java
                ├── ReviewMapper.java
                └── ChatMapper.java
```

---

*UniShare Backend — built with Spring Boot 3.4 · Java 21 · MySQL 8 · JWT · Flyway*
