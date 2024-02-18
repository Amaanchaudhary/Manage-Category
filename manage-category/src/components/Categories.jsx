import api from '../helpers/axios.config'
import './Categories.css'
import React, { useEffect, useState } from 'react'

const Categories = () => {

    const [popup, setPopup] = useState(false)
    const [searchQuery, setSearchQuery] = useState('');
    // console.log(searchQuery)
    const [newCategory, setNewCategory] = useState(
        {
            categoryName: "",
            categoryDescription: "",
            categoryColor: "",
            checked: false,
            categoryImage: null
        }
    )
    const [category, setCategory] = useState([])
    const [checked, setChecked] = useState([])
    const [allChecked, setAllChecked] = useState(false)

    const handleChange = (event) => {
        setNewCategory({ ...newCategory, [event.target.name]: event.target.value })
    }

    const handleImageChange = (index, e) => {
        const file = e.target.files[0];

        if (file.size > 500 * 1024) { // Convert kb to bytes (1kb = 1024 bytes)
            e.target.value = null
            alert('File size exceeds 500kb. Please choose a smaller file.');
            return; // Exit function if file size exceeds limit
        } else {
            const reader = new FileReader();
            reader.onload = () => {
                const base64String = reader.result.split(',')[1]; // Extract base64 string
                setNewCategory({ ...newCategory, [e.target.name]: base64String })
            };
            reader.readAsDataURL(file);
        }
    }

    const handleSubmit = async (event) => {
        event.preventDefault();
        if (newCategory.categoryName && newCategory.categoryDescription && newCategory.categoryImage) {
            try {
                const response = await api.post("/category/add", { newCategory })
                if (response.data.success) {
                    alert("Category Added")
                    setPopup(!popup)
                    getAllCategory();
                    setNewCategory({
                        categoryName: "",
                        categoryDescription: "",
                        categoryColor: "",
                        checked: false,
                        categoryImage: null
                    })

                }

            } catch (error) {
                console.log("Error hai", error?.data?.message)
            }
        }
        else {
            alert('Please fill in all required fields for each category.');
        }
    }

    const handleChecked = (id) => {
        if (checked.includes(id)) {
            const updatedChecked = checked.filter(categoryId => categoryId !== id);
            setChecked(updatedChecked)
        } else {
            setChecked([...checked, id])
        }
    }

    const getAllCategory = async () => {
        try {
            const { data } = await api.get("/category/get-all-category")
            if (data.success) {
                // console.log("response ye hai", data.categories)

                const updatedCategories = data.categories.map(category => {
                    // Convert categoryImage from Base64 string to data URL
                    const base64String = category.categoryImage;
                    const contentType = 'image/jpeg'; // Adjust content type as needed
                    const dataUrl = `data:${contentType};base64,${base64String}`;
                    return { ...category, categoryImage: dataUrl };
                });
                setCategory(updatedCategories);
            }
        } catch (error) {
            console.log("error hai get me", error?.data?.message)
        }
    }

    const handleDelete = async () => {
        if (allChecked) {
            const confirmed = window.confirm("Are you sure you want to delete all categories?");
            if (confirmed) {
                deleteAllCategories();
            }
        } else {
            const confirmed = window.confirm("Are you sure you want to delete this category?");
            if (checked.length && confirmed) {
                try {
                    const response = await api.delete(`/category/delete`, { params: { ids: checked } })
                    if (response.data.success) {
                        alert(response.data.message);
                        getAllCategory();
                    }
                } catch (error) {
                    console.log("error hai delete me", error?.data?.message)
                }
            } else {
                alert("Please Select some item to delete")
            }
        }
    }

    const deleteAllCategories = async () => {
        try {
            const response = await api.delete("/category/delete/all")
            if (response.data.success) {
                alert(response.data.message)
                setCategory([])
                setAllChecked(false)
            }

        } catch (error) {
            console.log("error hai delete me", error?.data?.message)
        }
    }

    const filteredCategories = category.filter(cat =>
        cat.categoryName.toLowerCase().includes(searchQuery.toLowerCase())
    );
    // console.log(filteredCategories);

    useEffect(() => {
        getAllCategory();
    }, [])

    return (
        <div className='container'>
            <div className='inner-div'>
                <div className='heading-div'>
                    <p className='view-category'>View Services Category</p>
                    <button onClick={() => setPopup(!popup)} className='button-right'>+ Add New Category</button>
                </div>
                <div className='search-del-div'>
                    <input className='all-checkbox' type='checkbox' onClick={() => setAllChecked(!allChecked)} />
                    <p className='service-category-p'>Service Category</p>
                    <div className='search-div'>
                        <input className='search-input' placeholder='Search here' type='text' value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} />
                    </div>
                    <button className='delete-cat-btn' onClick={handleDelete}>Delete</button>
                </div>
                <div className='all-category'>
                    {filteredCategories.map((cat, index) => (
                        <div key={index} className='single-cat'>
                            <div className='check-n-img-div'>
                                <input className='category-check' type='checkbox' onChange={() => handleChecked(cat._id)} />
                                <div className='category-img-div'>
                                    <img src={cat.categoryImage} alt="Category" />
                                </div>
                            </div>
                            <div className='category-name-desc-div'>
                                <h3 className='cat-name'>{cat.categoryName}</h3>
                                <p className='cat-desc'>{cat.categoryDescription}</p>
                            </div>
                        </div>
                    ))
                    }
                </div>
            </div>
            {popup &&
                <div className="popup">
                    <div className="popup-inner">
                        <form className='form' onSubmit={handleSubmit}>
                            <div className="form-group-top">
                                <h2>Add New Category</h2>
                                <i onClick={() => setPopup(!popup)} className="fa-solid fa-xmark fa-2xl"></i>
                            </div>
                            <div className="form-group">
                                <label htmlFor="categoryName">Category Name:</label>
                                <input type="text" id="categoryName" name="categoryName" onChange={handleChange} required />
                            </div>
                            <div className="form-group">
                                <label htmlFor="categoryColor">Appointment Color:</label><br />
                                <select id="categoryColor" name="categoryColor" onChange={handleChange} required>
                                    <option value="">Select Color</option>
                                    <option value="red">Red</option>
                                    <option value="blue">Blue</option>
                                    <option value="green">Green</option>
                                    <option value="black">Black</option>
                                </select>
                            </div>
                            <div className="form-group">
                                <label htmlFor="categoryDescription">Category Description:</label>
                                <textarea id="categoryDescription" name="categoryDescription" onChange={handleChange} maxLength={255} required />
                            </div>
                            <div className="form-group">
                                <label htmlFor="categoryImage">Category Image:</label>
                                <input type="file" id="categoryImage" name="categoryImage" onChange={(e) => handleImageChange(category.length, e)} accept="image/*" required />
                            </div>
                            {/* {errorMessage && <div className="error-message">{errorMessage}</div>} */}
                            <button type="submit">Save</button>
                        </form>
                        {/* <button onClick={togglePopup}>Close</button> */}
                    </div>
                </div>
            }
        </div>
    )
}

export default Categories