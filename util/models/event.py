from pydantic import BaseModel
from typing import Optional

class Contact(BaseModel):
    name: str
    contact_phone: str
    show_phone: bool
    contact_email: str
    email: str
    show_email: bool


class RsvpForm(BaseModel):
    phone: str
    address: str
    allow_guests: bool
    accept_rsvps: bool
    gather_volunteers: bool


class Address(BaseModel):
    address1: str
    city: str
    state: str


class Venue(BaseModel):
    name: str
    address: Address

class Event(BaseModel):
    status: str
    name: str
    intro: str
    id: Optional[int]
    time_zone: str
    start_time: str
    end_time: str
    contact: Contact
    rsvp_form: RsvpForm
    show_guests: bool
    capacity: int
    venue: Venue

class HasEvent(BaseModel):
    event: Event
