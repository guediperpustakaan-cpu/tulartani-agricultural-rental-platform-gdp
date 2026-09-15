import {
  pgTable,
  pgEnum,
  serial,
  integer,
  text,
  timestamp,
  boolean,
  date,
} from "drizzle-orm/pg-core";

// ---------- ENUMS ----------
export const userRoleEnum = pgEnum("user_role", ["OWNER", "RENTER", "ADMIN"]);
export const equipmentStatusEnum = pgEnum("equipment_status", [
  "AVAILABLE",
  "MAINTENANCE",
  "RENTED",
]);
export const bookingStatusEnum = pgEnum("booking_status", [
  "PENDING",
  "CONFIRMED",
  "COMPLETED",
  "CANCELLED",
  "REJECTED",
]);
export const paymentStatusEnum = pgEnum("payment_status", ["UNPAID", "PAID"]);

// ---------- USERS ----------
export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  email: text("email").notNull().unique(),
  password: text("password").notNull(),
  phone: text("phone"),
  address: text("address"),
  role: userRoleEnum("role").notNull().default("RENTER"),
  is_verified: boolean("is_verified").notNull().default(false),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

// ---------- CATEGORIES ----------
export const categories = pgTable("categories", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  icon: text("icon").notNull().default("Cog"),
});

// ---------- EQUIPMENT ----------
export const equipment = pgTable("equipment", {
  id: serial("id").primaryKey(),
  ownerId: integer("owner_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  categoryId: integer("category_id")
    .notNull()
    .references(() => categories.id, { onDelete: "cascade" }),
  name: text("name").notNull(),
  description: text("description").notNull(),
  pricePerDay: integer("price_per_day").notNull(),
  locationLat: text("location_lat"),
  locationLong: text("location_long"),
  locationName: text("location_name").notNull().default(""),
  status: equipmentStatusEnum("status").notNull().default("AVAILABLE"),
  imageUrl: text("image_url"),
  isVerified: boolean("is_verified").notNull().default(false),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

// ---------- BOOKINGS ----------
export const bookings = pgTable("bookings", {
  id: serial("id").primaryKey(),
  renterId: integer("renter_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  equipmentId: integer("equipment_id")
    .notNull()
    .references(() => equipment.id, { onDelete: "cascade" }),
  startDate: date("start_date").notNull(),
  endDate: date("end_date").notNull(),
  totalPrice: integer("total_price").notNull(),
  status: bookingStatusEnum("status").notNull().default("PENDING"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

// ---------- PAYMENTS ----------
export const payments = pgTable("payments", {
  id: serial("id").primaryKey(),
  bookingId: integer("booking_id")
    .notNull()
    .references(() => bookings.id, { onDelete: "cascade" }),
  amount: integer("amount").notNull(),
  paymentStatus: paymentStatusEnum("payment_status").notNull().default("UNPAID"),
  paymentDate: timestamp("payment_date"),
  method: text("method").default("Transfer Bank"),
});

// ---------- REVIEWS ----------
export const reviews = pgTable("reviews", {
  id: serial("id").primaryKey(),
  bookingId: integer("booking_id")
    .notNull()
    .references(() => bookings.id, { onDelete: "cascade" }),
  renterId: integer("renter_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  rating: integer("rating").notNull(),
  comment: text("comment"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

// ---------- TYPES ----------
export type User = typeof users.$inferSelect;
export type NewUser = typeof users.$inferInsert;
export type Category = typeof categories.$inferSelect;
export type Equipment = typeof equipment.$inferSelect;
export type NewEquipment = typeof equipment.$inferInsert;
export type Booking = typeof bookings.$inferSelect;
export type NewBooking = typeof bookings.$inferInsert;
export type Payment = typeof payments.$inferSelect;
export type Review = typeof reviews.$inferSelect;
