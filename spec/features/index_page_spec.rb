require 'spec_helper'

RSpec.describe 'Index page', type: :feature do
  before(:each) do
    visit '/'
  end

  it 'has welcome text' do
    expect(page).to have_content('Welcome to Ossert!')
  end

  it 'has search form' do
    expect(page).to have_css('form.search')
  end

  it 'has at least one analyzed project link' do
    expect(page).to have_css('.gem__link')

    all('a.gem__link').each do |link|
      expect(@projects).to include(link[:href][/\/\w+\z/][1..-1])
    end
  end
end
