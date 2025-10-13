import React from 'react';

const experiences = [
  { title: 'Pmp Developer', company: 'Dummy.com', period: 'Year: 2016 - 18', description: 'Everyone realizes why a new common language would be desirable: one could refuse to pay expensive translators. To achieve this, it would be necessary to have uniform grammar, pronunciation and more common words.' },
  { title: 'UI/UX Designer', company: 'Dummy Inc', period: 'Year: 2015 - 16', description: 'If several languages coalesce, the grammar of the resulting language is more simple and regular than that of the individual languages. The new common language will be more simple and regular than the existing European languages.' },
  { title: 'Content creator', company: 'Dummy Plc', period: 'Year: 2014 - 15', description: 'The European languages are members of the same family. Their separate existence is a myth. For science music sport etc, Europe uses the same vocabulary. The languages only differ in their grammar their pronunciation.' }
];

const ExperienceTab: React.FC = () => {
  return (
    <div>
      <h3 className="text-2xl font-bold text-gray-900 mb-6">Work Experience</h3>
      <div className="space-y-6">
        {experiences.map((exp, index) => (
          <div key={index} className="bg-white p-6 rounded-lg shadow-sm border border-gray-100">
            <h4 className="text-lg font-semibold text-gray-900">{exp.title}</h4>
            <p className="text-sm text-gray-500 mb-3">{exp.company} - {exp.period}</p>
            <p className="text-gray-700 leading-relaxed">{exp.description}</p>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ExperienceTab;
