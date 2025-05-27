"use client";
import { useState, useRef, useEffect } from 'react'

type IdeaFormProps = {
  open: boolean
  onClose: () => void
  onSubmit: (data: { name: string; headline: string; lightning: string; idea: string }) => void
}

const IdeaForm = ({ open, onClose, onSubmit }: IdeaFormProps) => {
  const [form, setForm] = useState({
    name: '',
    headline: '',
    lightning: '',
    idea: '',
  })
  const modalRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!open) setForm({ name: '', headline: '', lightning: '', idea: '' })
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    }
    if (open) document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [open, onClose])

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (modalRef.current && !modalRef.current.contains(e.target as Node)) {
        onClose()
      }
    }
    if (open) document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [open, onClose])

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value })
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    onSubmit({ ...form, headline: form.headline.trim() })
    setForm({ name: '', headline: '', lightning: '', idea: '' })
    onClose()
  }

  return (
    <div
      className={`fixed inset-0 z-30 flex items-end justify-center transition-all duration-300 ${open ? 'pointer-events-auto bg-black/40' : 'pointer-events-none bg-transparent'}`}
      aria-modal="true"
      role="dialog"
      style={{ visibility: open ? 'visible' : 'hidden' }}
    >
      <div
        ref={modalRef}
        className={`w-full max-w-md mb-8 rounded-xl bg-black/90 p-8 shadow-lg flex flex-col gap-4 transform transition-all duration-300 ${open ? 'translate-y-0 opacity-100' : 'translate-y-12 opacity-0'}`}
      >
        <button
          type="button"
          onClick={onClose}
          className="absolute top-2 right-2 text-gray-400 hover:text-white focus:outline-none"
          aria-label="Close form"
        >
          ×
        </button>
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <label htmlFor="name" className="sr-only">Your Name</label>
          <input
            id="name"
            name="name"
            type="text"
            placeholder="Your Name"
            value={form.name}
            onChange={handleChange}
            className="rounded-md px-4 py-3 bg-zinc-900 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-orange-500 touch-manipulation"
            aria-label="Your Name"
            autoFocus={open}
          />
          <label htmlFor="headline" className="sr-only">Catchy Headline</label>
          <input
            id="headline"
            name="headline"
            type="text"
            placeholder="Catchy Headline"
            value={form.headline}
            onChange={handleChange}
            className="rounded-md px-4 py-3 bg-zinc-900 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-orange-500 touch-manipulation"
            aria-label="Catchy Headline"
          />
          <label htmlFor="lightning" className="sr-only">Your Lightning Address</label>
          <input
            id="lightning"
            name="lightning"
            type="text"
            placeholder="Your Lightning Address"
            value={form.lightning}
            onChange={handleChange}
            className="rounded-md px-4 py-3 bg-zinc-900 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-orange-500 touch-manipulation"
            aria-label="Your Lightning Address"
          />
          <label htmlFor="idea" className="sr-only">How can we add value to Bitcoin?</label>
          <textarea
            id="idea"
            name="idea"
            placeholder="How can we add value to Bitcoin?"
            value={form.idea}
            onChange={handleChange}
            className="rounded-md px-4 py-3 bg-zinc-900 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-orange-500 min-h-[120px] resize-none touch-manipulation"
            aria-label="How can we add value to Bitcoin?"
          />
          <button
            type="submit"
            className="mt-4 w-full rounded-full bg-orange-500 px-6 py-4 font-bold text-white shadow-lg hover:bg-orange-600 focus:outline-none focus:ring-2 focus:ring-orange-400 focus:ring-offset-2 transition active:scale-95 active:bg-orange-700 touch-manipulation"
            aria-label="Submit Idea"
          >
            Submit Idea
          </button>
        </form>
      </div>
    </div>
  )
}

export default IdeaForm 