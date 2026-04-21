import { useState } from 'react'
import { SectionIntro } from '../components/UiBlocks'

function CreateProjectPage() {
  const [form, setForm] = useState({
    title: '',
    problem: '',
    solution: '',
    roles: '',
    funding: '',
  })

  function handleChange(e) {
    setForm({ ...form, [e.target.name]: e.target.value })
  }

  function handleSubmit(e) {
    e.preventDefault()
    console.log('Project created:', form)

    // later → API call
    alert('Project created (mock)')
  }

  return (
    <div className="page">
      <section className="page-hero">
        <SectionIntro
          eyebrow="Create project"
          title="Turn your idea into a structured project"
          description="Define your startup clearly to attract contributors and investors."
        />
      </section>

      <section className="content-section">
        <form className="glass-panel form-card" onSubmit={handleSubmit}>
          <div className="form-grid">

            <label>
              Project Title
              <input name="title" onChange={handleChange} value={form.title} />
            </label>

            <label>
              Problem
              <textarea name="problem" rows="4" onChange={handleChange} value={form.problem} />
            </label>

            <label>
              Solution
              <textarea name="solution" rows="4" onChange={handleChange} value={form.solution} />
            </label>

            <label>
              Roles Needed
              <input name="roles" onChange={handleChange} value={form.roles} />
            </label>

            <label>
              Funding Goal
              <input name="funding" onChange={handleChange} value={form.funding} />
            </label>

          </div>

          <div className="action-row">
            <button className="primary-button" type="submit">
              Create Project
            </button>

            <button className="secondary-button" type="button">
              Generate with AI
            </button>
          </div>
        </form>
      </section>
    </div>
  )
}

export default CreateProjectPage