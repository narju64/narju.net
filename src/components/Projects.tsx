import React from 'react'

interface Project {
  href: string
  title: string
  description: string
  external?: boolean
}

const projects: Project[] = [
  {
    href: 'https://echoes.narju.net',
    title: 'Echoes',
    description: 'A web-based game with URL-based logic',
    external: true
  },
  {
    href: '/projects/phonetic-alphabet',
    title: 'nPA Translator',
    description: 'Translate English text into narju\'s Phonetic Alphabet',
    external: false
  }
]

const Projects: React.FC = () => {
  return (
    <section className="projects">
      <div className="container">
        <h2 className="section-title">Projects</h2>
        <div className="projects-grid">
          {projects.map((project) => (
            <a 
              key={project.href} 
              href={project.href} 
              className="project-card"
              target={project.external ? '_blank' : undefined}
              rel={project.external ? 'noopener noreferrer' : undefined}
            >
              <h3 className="project-title">{project.title}</h3>
              <p className="project-description">{project.description}</p>
              <span className="project-link">Play Now →</span>
            </a>
          ))}
        </div>
      </div>
    </section>
  )
}

export default Projects 