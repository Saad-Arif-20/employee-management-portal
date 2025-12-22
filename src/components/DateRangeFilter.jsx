import React, { useState, useRef, useEffect } from 'react';
import { DateRange } from 'react-date-range';
import { format } from 'date-fns';
import { X, Calendar, Edit2 } from 'lucide-react';
import { Button } from 'reactstrap';
import 'react-date-range/dist/styles.css'; // main style file
import 'react-date-range/dist/theme/default.css'; // theme css file

const DateRangeFilter = ({ startDate, endDate, onChange, bgColor = 'bg-light', showBorder = false }) => {
    const [isOpen, setIsOpen] = useState(false);
    const [range, setRange] = useState([
        {
            startDate: startDate ? new Date(startDate) : new Date(),
            endDate: endDate ? new Date(endDate) : new Date(),
            key: 'selection'
        }
    ]);
    const wrapperRef = useRef(null);

    useEffect(() => {
        setRange([
            {
                startDate: startDate ? new Date(startDate) : new Date(),
                endDate: endDate ? new Date(endDate) : new Date(),
                key: 'selection'
            }
        ]);
    }, [startDate, endDate]);

    useEffect(() => {
        function handleClickOutside(event) {
            if (wrapperRef.current && !wrapperRef.current.contains(event.target)) {
                setIsOpen(false);
            }
        }
        document.addEventListener("mousedown", handleClickOutside);
        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
        };
    }, [wrapperRef]);

    const handleSelect = (item) => {
        setRange([item.selection]);
    };

    const handleSave = () => {
        onChange(range[0].startDate, range[0].endDate);
        setIsOpen(false);
    };

    const handleClear = (e) => {
        e.stopPropagation();
        onChange(null, null);
        setRange([{
            startDate: new Date(),
            endDate: new Date(),
            key: 'selection'
        }]);
    };

    const formatDateDisplay = (date) => {
        if (!date) return '';
        return format(date, 'MMM d');
    };

    const displayValue = startDate && endDate
        ? `${formatDateDisplay(new Date(startDate))} - ${formatDateDisplay(new Date(endDate))}`
        : 'Select Date Range';

    const maxDate = new Date();
    maxDate.setHours(23, 59, 59, 999);

    return (
        <div className="position-relative" ref={wrapperRef}>
            <div
                className={`d-flex align-items-center ${showBorder ? 'border' : ''} rounded ${bgColor} px-3 py-1 cursor-pointer`}
                onClick={() => setIsOpen(!isOpen)}
                style={{ cursor: 'pointer', minWidth: '200px', height: '38px', borderColor: showBorder ? '#e2e8f0' : undefined }}
            >
                <Calendar size={18} className="text-muted me-2" />
                <span className={`flex-grow-1 ${!startDate ? 'text-muted' : 'text-dark fw-medium'}`}>
                    {displayValue}
                </span>
                {(startDate || endDate) && (
                    <X
                        size={16}
                        className="text-muted ms-2 hover-text-danger"
                        onClick={handleClear}
                    />
                )}
            </div>

            {isOpen && (
                <div
                    className="position-absolute bg-white shadow-lg rounded overflow-hidden"
                    style={{
                        top: '100%',
                        left: 0,
                        zIndex: 1000,
                        marginTop: '8px',
                        width: '350px'
                    }}
                >
                    {/* Header */}
                    <div className="bg-primary p-3 text-white">
                        <div className="d-flex justify-content-between align-items-center mb-3">
                            <X
                                size={20}
                                className="cursor-pointer"
                                onClick={() => setIsOpen(false)}
                                style={{ cursor: 'pointer' }}
                            />
                            <span
                                className="fw-bold cursor-pointer small"
                                onClick={handleSave}
                                style={{ cursor: 'pointer', letterSpacing: '0.5px' }}
                            >
                                SAVE
                            </span>
                        </div>
                        <div className="mb-1 text-uppercase small opacity-75" style={{ fontSize: '0.75rem', letterSpacing: '1px' }}>
                            Select Range
                        </div>
                        <div className="d-flex justify-content-between align-items-center">
                            <h4 className="mb-0 fw-bold">
                                {range[0].startDate ? format(range[0].startDate, 'MMM d') : 'Start'} - {range[0].endDate ? format(range[0].endDate, 'MMM d') : 'End'}
                            </h4>
                            <Edit2 size={18} className="opacity-75" />
                        </div>
                    </div>

                    {/* Calendar */}
                    <div className="p-0">
                        <DateRange
                            editableDateInputs={true}
                            onChange={handleSelect}
                            moveRangeOnFirstSelection={false}
                            ranges={range}
                            rangeColors={['#4f46e5']} // Primary color
                            showDateDisplay={false} // We have our own custom header
                            months={1}
                            direction="horizontal"
                            className="w-100 border-0"
                            maxDate={maxDate}
                        />
                    </div>
                </div>
            )}
        </div>
    );
};

export default DateRangeFilter;
