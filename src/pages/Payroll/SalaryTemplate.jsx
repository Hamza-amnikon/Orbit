import React, { useState } from "react";
import "./SalaryTemplate.css";

function SalaryTemplate() {
    const [search, setSearch] = useState("");
    const [status, setStatus] = useState("");
    const [showForm, setShowForm] = useState(false);

    const [templateName, setTemplateName] = useState("");
    const [country, setCountry] = useState("");

    const [description, setDescription] = useState("");

    // Will come from API later
    const templates = [];

    const filteredTemplates = templates.filter((template) => {
        const matchesSearch = template.templateName
            ?.toLowerCase()
            .includes(search.toLowerCase());

        const matchesStatus =
            status === "" || template.status === status;

        return matchesSearch && matchesStatus;
    });

    const handleSaveTemplate = (e) => {
        e.preventDefault();

        console.log({
            templateName,
            country,

            description
        });

        // API will be connected here later
    };

    const handleEdit = (templateId) => {
        console.log("Edit template:", templateId);
    };

    const handleDelete = (templateId) => {
        console.log("Delete template:", templateId);
    };

    if (showForm) {
        return (
            <div className="salary-template-page">

                <div className="salary-template-header">

                    <div>
                        <h1>Create Salary Template</h1>
                        <p>
                            Create a salary structure template for employees
                        </p>
                    </div>

                </div>

                <div className="salary-template-form-card">

                    <form onSubmit={handleSaveTemplate}>

                        <div className="form-section">

                            <h2>Template Information</h2>

                            <div className="form-group">

                                <label>
                                    Template Name
                                </label>

                                <input
                                    type="text"
                                    value={templateName}
                                    onChange={(e) =>
                                        setTemplateName(e.target.value)
                                    }
                                    placeholder="Enter template name"
                                    required
                                />

                            </div>


                            <div className="form-group">

                                <label>
                                    Country
                                </label>

                                <select
                                    value={country}
                                    onChange={(e) =>
                                        setCountry(e.target.value)
                                    }
                                    required
                                >
                                    <option value="">
                                        Select Country
                                    </option>

                                    <option value="UAE">
                                        UAE
                                    </option>

                                    <option value="India">
                                        India
                                    </option>
                                </select>

                            </div>

                            <div className="form-group">

                                <label>
                                    Description
                                </label>

                                <textarea
                                    value={description}
                                    onChange={(e) =>
                                        setDescription(e.target.value)
                                    }
                                    placeholder="Enter template description"
                                    rows="4"
                                />

                            </div>

                        </div>


                        <div className="form-section">

                            <div className="component-header">

                                <div>
                                    <h2>Salary Components</h2>

                                    <p>
                                        Add salary components to this template
                                    </p>
                                </div>

                                <button
                                    type="button"
                                    className="add-component-btn"
                                >
                                    + Add Component
                                </button>

                            </div>


                            <div className="empty-component">

                                <div className="empty-component-icon">
                                    +
                                </div>

                                <h3>
                                    No components added yet
                                </h3>

                                <p>
                                    Add salary components to create the
                                    salary structure.
                                </p>

                                <button
                                    type="button"
                                    className="empty-add-component-btn"
                                >
                                    + Add Component
                                </button>

                            </div>

                        </div>


                        <div className="form-actions">

                            <button
                                type="button"
                                className="cancel-btn"
                                onClick={() => setShowForm(false)}
                            >
                                Cancel
                            </button>

                            <button
                                type="submit"
                                className="save-template-btn"
                            >
                                Save Template
                            </button>

                        </div>

                    </form>

                </div>

            </div>
        );
    }


    return (
        <div className="salary-template-page">

            <div className="salary-template-header">

                <div>
                    <h1>Salary Templates</h1>

                    <p>
                        Create and manage employee salary templates
                    </p>
                </div>

                <button
                    className="add-template-btn"
                    onClick={() => setShowForm(true)}
                >
                    + Add Template
                </button>

            </div>


            <div className="salary-template-card">

                <div className="salary-template-toolbar">

                    <input
                        type="text"
                        className="template-search"
                        placeholder="Search templates..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                    />

                    <select
                        className="template-status-filter"
                        value={status}
                        onChange={(e) => setStatus(e.target.value)}
                    >
                        <option value="">
                            All Status
                        </option>

                        <option value="Active">
                            Active
                        </option>

                        <option value="Inactive">
                            Inactive
                        </option>
                    </select>

                </div>


                <div className="salary-template-table-wrapper">

                    <table className="salary-template-table">

                        <thead>

                            <tr>
                                <th>Template Name</th>
                                <th>Components</th>
                                <th>Employees</th>
                                <th>Status</th>
                                <th>Actions</th>
                            </tr>

                        </thead>

                        <tbody>

                            {filteredTemplates.length > 0 ? (

                                filteredTemplates.map((template) => (

                                    <tr key={template.templateId}>

                                        <td>
                                            {template.templateName}
                                        </td>

                                        <td>
                                            {template.componentCount}
                                        </td>

                                        <td>
                                            {template.employeeCount}
                                        </td>

                                        <td>

                                            <span
                                                className={
                                                    template.status === "Active"
                                                        ? "status-active"
                                                        : "status-inactive"
                                                }
                                            >
                                                {template.status}
                                            </span>

                                        </td>

                                        <td className="template-actions">

                                            <button
                                                className="edit-btn"
                                                onClick={() =>
                                                    handleEdit(
                                                        template.templateId
                                                    )
                                                }
                                            >
                                                Edit
                                            </button>

                                            <button
                                                className="delete-btn"
                                                onClick={() =>
                                                    handleDelete(
                                                        template.templateId
                                                    )
                                                }
                                            >
                                                Delete
                                            </button>

                                        </td>

                                    </tr>

                                ))

                            ) : (

                                <tr>

                                    <td
                                        colSpan="5"
                                        className="no-template-data"
                                    >
                                        No salary templates found
                                    </td>

                                </tr>

                            )}

                        </tbody>

                    </table>

                </div>

            </div>

        </div>
    );
}

export default SalaryTemplate;