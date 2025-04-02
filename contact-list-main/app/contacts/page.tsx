'use client'

import { useState, useEffect } from 'react'
import { useAuth } from '../contexts/AuthContext'
import { useRouter } from 'next/navigation'

type Contact = {
  _id: string
  name: string
  email: string
  phone: string
}

export default function ContactsPage() {
  const [contacts, setContacts] = useState<Contact[]>([])
  const [newContact, setNewContact] = useState({ name: '', email: '', phone: '' })
  const [editingContact, setEditingContact] = useState<Contact | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const { user, logout } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (!user) {
      router.push('/')
      return
    }
    
    fetchContacts()
  }, [user, router])

  const fetchContacts = async () => {
    try {
      const res = await fetch(`/api/contacts?userId=${user!.id}`)
      if (!res.ok) throw new Error('Failed to fetch contacts')
      const data = await res.json()
      setContacts(data)
    } catch (error) {
      console.error('Fetch contacts error:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const addContact = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      const res = await fetch('/api/contacts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...newContact, userId: user!.id }),
      })
      
      if (!res.ok) throw new Error('Failed to add contact')
      
      const contact = await res.json()
      setContacts([...contacts, contact])
      setNewContact({ name: '', email: '', phone: '' })
    } catch (error) {
      console.error('Add contact error:', error)
    }
  }

  const updateContact = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!editingContact) return

    try {
      const res = await fetch(`/api/contacts/${editingContact._id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(editingContact),
      })
      
      if (!res.ok) throw new Error('Failed to update contact')
      
      const updatedContact = await res.json()
      setContacts(contacts.map((c) => 
        c._id === updatedContact._id ? updatedContact : c
      ))
      setEditingContact(null)
    } catch (error) {
      console.error('Update contact error:', error)
    }
  }

  const deleteContact = async (id: string) => {
    try {
      const res = await fetch(`/api/contacts/${id}`, {
        method: 'DELETE',
      })
      
      if (!res.ok) throw new Error('Failed to delete contact')
      
      setContacts(contacts.filter((c) => c._id !== id))
    } catch (error) {
      console.error('Delete contact error:', error)
    }
  }

  const handleLogout = () => {
    logout()
    router.push('/')
  }

  if (!user) return null

  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
      </div>
    )
  }

  return (
    <div className="container mx-auto p-4">
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-2xl font-bold">Contact List</h1>
        <button
          onClick={handleLogout}
          className="bg-red-500 hover:bg-red-700 text-white font-bold py-2 px-4 rounded"
        >
          Logout
        </button>
      </div>

      <form onSubmit={editingContact ? updateContact : addContact} className="mb-4">
        <input
          type="text"
          placeholder="Name"
          value={editingContact ? editingContact.name : newContact.name}
          onChange={(e) =>
            editingContact
              ? setEditingContact({ ...editingContact, name: e.target.value })
              : setNewContact({ ...newContact, name: e.target.value })
          }
          className="border p-2 mr-2"
          required
        />
        <input
          type="email"
          placeholder="Email"
          value={editingContact ? editingContact.email : newContact.email}
          onChange={(e) =>
            editingContact
              ? setEditingContact({ ...editingContact, email: e.target.value })
              : setNewContact({ ...newContact, email: e.target.value })
          }
          className="border p-2 mr-2"
          required
        />
        <input
          type="tel"
          placeholder="Phone"
          value={editingContact ? editingContact.phone : newContact.phone}
          onChange={(e) =>
            editingContact
              ? setEditingContact({ ...editingContact, phone: e.target.value })
              : setNewContact({ ...newContact, phone: e.target.value })
          }
          className="border p-2 mr-2"
          required
        />
        <button
          type="submit"
          className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
        >
          {editingContact ? 'Update Contact' : 'Add Contact'}
        </button>
        {editingContact && (
          <button
            onClick={() => setEditingContact(null)}
            className="bg-gray-500 hover:bg-gray-700 text-white font-bold py-2 px-4 rounded ml-2"
          >
            Cancel
          </button>
        )}
      </form>

      <ul>
        {contacts.map((contact) => (
          <li key={contact._id} className="border-b py-2">
            <div className="flex justify-between items-center">
              <div>
                <p className="font-bold">{contact.name}</p>
                <p>{contact.email}</p>
                <p>{contact.phone}</p>
              </div>
              <div>
                <button
                  onClick={() => setEditingContact(contact)}
                  className="bg-yellow-500 hover:bg-yellow-700 text-white font-bold py-1 px-2 rounded mr-2"
                >
                  Edit
                </button>
                <button
                  onClick={() => deleteContact(contact._id)}
                  className="bg-red-500 hover:bg-red-700 text-white font-bold py-1 px-2 rounded"
                >
                  Delete
                </button>
              </div>
            </div>
          </li>
        ))}
      </ul>
    </div>
  )
}

