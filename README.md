# 🎥 Cinematic Explorer - A Semantic Web Application for Movie Exploration

Cinematic Explorer is an intuitive semantic web application designed to explore a movie ontology dataset. It enables users to interact with data such as movies, genres, directors, actors, and awards in a visually appealing and structured manner. This project demonstrates the power of semantic web technologies by leveraging SPARQL queries, interactive UI elements, and real-time data visualization.

---

## 📖 Features

### 🔍 Search and Explore
- **Search by Movie Name:** Quickly find movies and their detailed information using an interactive search bar.
- **Genre Categorization:** Movies are categorized by genres, enabling seamless navigation through structured lists.

### 🖼️ Visualizations
- **Movie Cards:** Display movies with their titles and genres in interactive, visually appealing cards.
- **Interactive Modals:** Detailed information, such as runtime, release date, genre, and director, is dynamically displayed in modals.
- **Ontology Integration:** Visual representation of the ontology relationships showcasing the semantic structure of the dataset.

### 🔗 Semantic Web Integration
- **SPARQL Queries:** Perform real-time queries to fetch and display movies, genres, and associated details.
- **Ontology-Based Backend:** A well-structured ontology ensures robust semantic relationships between entities.

---

## 🛠️ Tools and Technologies

### Ontology Development
- **OWL Ontology:** A comprehensive ontology designed for movies, genres, directors, actors, and awards.
- **Hermit Reasoner:** Used for reasoning over the ontology during development.

### Backend
- **SPARQL Endpoint:** Used to query the ontology dataset.
- **Apache Jena Fuseki:** Hosts the SPARQL endpoint.

### Frontend
- **HTML/CSS/JavaScript:** Core technologies for building an interactive and responsive user interface.
- **Dynamic Modals:** For displaying detailed movie information.

### Hosting and Testing
- **Hermit Reasoner:** Used for hosting and local testing during development.

---

## 🎯 How to Run

### Prerequisites
1. **Install Apache Jena Fuseki**
   - Ensure the SPARQL endpoint is running locally with the movie ontology dataset.
2. **Hermit Reasoner**
   - Use Hermit for local ontology hosting and reasoning.
3. **Web Browser**
   - Any modern browser (e.g., Chrome, Firefox, Edge).

### Steps
1. Clone this repository:
   ```bash
   git clone https://github.com/your-username/cinematic-explorer.git
   cd cinematic-explorer
2. Start the SPARQL endpoint using Apache Jena Fuseki and load the movie ontology dataset.
3. Open index.html in your browser to launch the application.
